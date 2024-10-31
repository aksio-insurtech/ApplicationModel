import { JSDOM } from 'jsdom';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { useObservableQuery } from '../../useObservableQuery';
import { QueryResultWithState } from '../../QueryResultWithState';
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

    constructor(defaultValue: TDataType) {
        this.defaultValue = defaultValue;
    }

    subscribe(callback: OnNextResult<QueryResult<TDataType>>, args?: TArguments): ObservableQuerySubscription<TDataType> {
        // Simulate an asynchronous data stream using setInterval
        const intervalId = setInterval(() => {
            const data = { data: "my string" } as QueryResult<TDataType>;
            callback(data);  // Pass data to the callback function
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
    let TestObservableQuery: Constructor<MockObservableQuery<string, any>>;
    let subscriberFunctionCallCount = 0;

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
        // Define the subclass once in the `beforeEach` to ensure test isolation
        TestObservableQuery = class extends MockObservableQuery<any, any> {};
        // Manually ensure `TestObservableQuery` has `subscribe` by copying it from `MockObservableQuery.prototype`
        TestObservableQuery.prototype.subscribe = (callback: OnNextResult<QueryResult<string>>, args?: any): ObservableQuerySubscription<string> => {
            subscriberFunctionCallCount++;
            return MockObservableQuery.prototype.subscribe.call(this, callback, args);
        }
    });

    afterEach(() => {
        clock.restore();  // Restore real timers
        // Use Testing Library's cleanup function to unmount components safely
        cleanup();
        subscriberFunctionCallCount = 0;
        // Clean up JSDOM and release resources after each test
        jsdom.window.close();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).navigator;
    });

    it('should initialize with default result and not subscribed', () => {
        const { result } = renderHook(() => useObservableQuery(TestObservableQuery as Constructor<MockObservableQuery<string, any>>));

        // Initial result should be empty
        expect(result.current[0]).to.deep.equal(QueryResultWithState.empty({}));
        expect(subscriberFunctionCallCount).to.equal(0);

        // Now advance effects to simulate `useEffect` updates, if needed
        act(() => {
            // This simulates any state updates in useEffect
        });
    });
});