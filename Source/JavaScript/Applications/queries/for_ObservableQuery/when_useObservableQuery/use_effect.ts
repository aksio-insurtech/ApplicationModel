// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { JSDOM } from 'jsdom';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { useObservableQuery } from '../../useObservableQuery';
import { IObservableQueryFor, OnNextResult } from '../../IObservableQueryFor';
import { ObservableQuerySubscription } from '../../ObservableQuerySubscription';
import { QueryResult } from '../../QueryResult';
import { Constructor } from '@aksio/fundamentals';
import { IObservableQueryConnection } from '../../IObservableQueryConnection';
import { DataReceived } from '../../ObservableQueryConnection';
import Handlebars from 'handlebars';
import {clearInterval} from "node:timers";

// Mock implementation of IObservableQueryFor
class MockObservableQuery<TDataType, TArguments = {}> implements IObservableQueryFor<TDataType, TArguments> {
    defaultValue: TDataType;
    route: string = '/mock';
    routeTemplate: Handlebars.TemplateDelegate<any> = Handlebars.compile(this.route);
    requestArguments: string[] = ['arg1', 'arg2'];

    constructor(defaultValue: TDataType = "" as unknown as TDataType) {
        this.defaultValue = defaultValue;
    }

    subscribe(callback: OnNextResult<QueryResult<TDataType>>, args?: TArguments): ObservableQuerySubscription<TDataType> {
        let count = 0;
        // Simulate an asynchronous data stream using setInterval
        const intervalId = setInterval(() => {
            const value = count > 0 ? `my string ${count}` : "my string";
            const data = { data: value } as QueryResult<TDataType>;
            callback(data);
            count++;// Pass data to the callback function
        }, 1000);

        // Return an ObservableQuerySubscription with an unsubscribe method
        return new ObservableQuerySubscription(new MockObservableQueryConnection<TDataType>(() => clearInterval(intervalId)));
    }
}

// Mock implementation of IObservableQueryConnection
class MockObservableQueryConnection<TDataType> implements IObservableQueryConnection<TDataType> {
    constructor(private onDisconnect: () => void = () => {}) {
    }

    connect(dataReceived: DataReceived<TDataType>): void {
    }

    disconnect(): void {
        this.onDisconnect();
    }
}

// Test suite for useObservableQuery
describe('useObservableQuery', () => {
    let clock: sinon.SinonFakeTimers;
    let jsdom: JSDOM;
    let subscribeSpy: sinon.SinonSpy;

    beforeEach(() => {
        // Set up a new JSDOM instance for each test
        jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
            url: 'http://localhost',
        });

        // Assign global variables to mimic the browser environment
        global.window = jsdom.window as unknown as Window & typeof globalThis;
        global.document = jsdom.window.document;
        global.navigator = {
            userAgent: 'node.js',
        } as Navigator;

        clock = sinon.useFakeTimers();  // Use fake timers for testing time-based behavior
        // Spy on the subscribe method directly on MockObservableQuery
        subscribeSpy = sinon.spy(MockObservableQuery.prototype, 'subscribe');
    });

    afterEach(() => {
        clock.restore();  // Restore real timers
        // Clean up the spy after each test
        subscribeSpy.restore();
        // Use Testing Library's cleanup function to unmount components safely
        cleanup();
        // Clean up JSDOM and release resources after each test
        jsdom.window.close();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).navigator;
    });


    it('should initialize with default result and should be subscribed with a manual unsubscribe function', () => {
        const { result } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));

        // Check that the initial result matches the default value
        expect(result.current.queryResult.data).to.deep.equal("");
        expect(subscribeSpy.called).to.be.true;
        expect(result.current.isSubscribed).to.be.true;
        expect(typeof result.current.unsubscribe).to.equal('function');
    });

    it('should call subscribe and receive data', () => {
        const { result } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));

        expect(result.current.queryResult.data).to.deep.equal("");

        // Now advance the timers to trigger the subscription data
        act(() => {
            clock.tick(1000);  // Advance the fake timer by 1 second
        });

        // Assert that subscribe was called once
        expect(subscribeSpy.calledOnce).to.be.true;
        expect(result.current.queryResult.data).to.deep.equal("my string");
        expect(result.current.isSubscribed).to.be.true;
        expect(typeof result.current.unsubscribe).to.equal('function');
    });

    it('should unsubscribe when unsubscribe is called manually', () => {
        const { result } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));
        // var unsubscribeSpy = sinon.spy(result.current.unsubscribe)

        // Call unsubscribe
        act(() => {
            result.current.unsubscribe(); // Manual unsubscribe function
        });

        expect(subscribeSpy.calledOnce).to.be.true;
        expect(result.current.isSubscribed).to.be.false;
    });

    it('should clean up subscription on component unmount', async () => {
        const { result, unmount, waitFor } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));

        // Initial check for subscription
        expect(result.current.isSubscribed).to.be.true;

        // Unmount the hook to trigger cleanup
        act(() => {
            unmount();
        });

        waitFor(() => !result.current.isSubscribed).then(() => {
            expect(subscribeSpy.calledOnce).to.be.true;
        });
    });

    it('should update data with each new subscription result', () => {
        const { result } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));

        // Initial data should be empty
        expect(result.current.queryResult.data).to.deep.equal("");

        // Simulate multiple data updates
        act(() => {
            clock.tick(1000);  // First update
        });
        expect(result.current.queryResult.data).to.deep.equal("my string");

        act(() => {
            clock.tick(1000);  // Second update
        });
        expect(result.current.queryResult.data).to.deep.equal("my string 1");

        act(() => {
            clock.tick(1000);  // Second update
        });
        expect(result.current.queryResult.data).to.deep.equal("my string 2");

        expect(subscribeSpy.callCount).to.equal(1);
    });

    it('should resubscribe when args change', () => {
        const { result, rerender } = renderHook(({ args }) => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>, args), {
            initialProps: { args: { arg1: 'initial' } }
        });

        // Initial subscription check
        expect(result.current.isSubscribed).to.be.true;
        expect(subscribeSpy.calledOnce).to.be.true;

        // Rerender with new args
        act(() => {
            rerender({ args: { arg1: 'updated' } });
        });

        // Expect a new subscription to have been triggered
        console.log(subscribeSpy.callCount);
        expect(subscribeSpy.calledTwice).to.be.true;
    });

    it('should handle errors in subscription gracefully', () => {
        // Modify `MockObservableQuery` to throw an error in `subscribe`
        const consoleErrorSpy = sinon.spy(console, 'error');
        subscribeSpy.restore();
        const errorQuery = sinon.stub(MockObservableQuery.prototype, 'subscribe').throws(new Error('Subscription failed'));

        const { result } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));

        expect(result.current.isSubscribed).to.be.false;
        expect(errorQuery.threw()).to.be.true;

        // Restore stub
        errorQuery.restore();
    });

    it('should handle multiple calls to unsubscribe gracefully', () => {
        const { result } = renderHook(() => useObservableQuery(MockObservableQuery as Constructor<MockObservableQuery<string, any>>));

        act(() => {
            result.current.unsubscribe(); // First call
        });

        expect(result.current.isSubscribed).to.be.false;

        // Call unsubscribe again and verify nothing changes or breaks
        act(() => {
            result.current.unsubscribe(); // Second call
        });

        expect(result.current.isSubscribed).to.be.false; // No change
        expect(subscribeSpy.calledOnce).to.be.true; // Original subscription only
    });
});