import { JSDOM } from 'jsdom';
import { renderHook, act, cleanup } from '@testing-library/react';
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

describe('useObservableQuery', () => {
    let clock: sinon.SinonFakeTimers;
    let jsdom: JSDOM;
    let subscribeSpy: sinon.SinonSpy;
    let queryInstance: MockObservableQuery<string>;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    beforeEach(() => {
        jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
            url: 'http://localhost',
            pretendToBeVisual: true
        });

        global.window = jsdom.window as unknown as Window & typeof globalThis;
        global.document = jsdom.window.document;
        global.navigator = {
            userAgent: 'node.js',
        } as Navigator;

        queryInstance = new MockObservableQuery<string>();
        subscribeSpy = sinon.spy(queryInstance, 'subscribe');
    });

    afterEach(() => {
        subscribeSpy.restore();
        // Then cleanup React
        cleanup();
        // Finally cleanup JSDOM
        jsdom.window.close();
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).navigator;
    });

    it('should initialize with default result and subscription', async () => {
        console.log('Test starting');

        // Create the instance first
        const mockQuery = new MockObservableQuery<string>();
        subscribeSpy = sinon.spy(mockQuery, 'subscribe');

        // Use a stub to return our instance when the constructor is called
        const constructorStub = sinon.stub().returns(mockQuery);

        const { result } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        console.log('Hook rendered');

        expect(result.current.queryResult.data).to.equal("");

        console.log('About to act');

        await act(async () => {
            console.log('Inside act');
            await Promise.resolve();
            console.log('Promise resolved');
            clock.tick(1);
            console.log('Clock ticked');
        });

        console.log('Subscription status:', subscribeSpy.called);

        expect(subscribeSpy.called).to.be.true;
        expect(typeof result.current.unsubscribe).to.equal('function');
    });

    it('should receive data from subscription', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        let capturedCallback: OnNextResult<QueryResult<string>>;

        // Use spy that captures the callback
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            capturedCallback = callback;
            return new ObservableQuerySubscription(new MockObservableQueryConnection());
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        const { result } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Let subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        expect(subscribeSpy.called).to.be.true;

        // Simulate receiving data through the subscription
        act(() => {
            capturedCallback({ data: "test data" } as QueryResult<string>);
        });

        // Verify the data was received
        expect(result.current.queryResult.data).to.equal("test data");
    });

    it('should unsubscribe when requested', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        const mockConnection = new MockObservableQueryConnection<string>();
        const disconnectSpy = sinon.spy(mockConnection, 'disconnect');

        // Spy on subscribe and return subscription with our spied connection
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            return new ObservableQuerySubscription(mockConnection);
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        const { result } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Let subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        expect(subscribeSpy.called).to.be.true;

        // Call unsubscribe
        act(() => {
            result.current.unsubscribe();
        });

        // Verify unsubscribe happened
        expect(disconnectSpy.called).to.be.true;
    });

    // Test cleanup
    it('should cleanup subscription when unmounted', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        const mockConnection = new MockObservableQueryConnection<string>();
        const disconnectSpy = sinon.spy(mockConnection, 'disconnect');

        // Spy on subscribe and return subscription with our spied connection
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            return new ObservableQuerySubscription(mockConnection);
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        const { unmount } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Let subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        expect(subscribeSpy.called).to.be.true;

        // Unmount the component
        act(() => {
            unmount();
        });

        // Verify cleanup happened
        expect(disconnectSpy.called).to.be.true;
    });

    // Test resubscription on args change
    it('should resubscribe when arguments change', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        const mockConnection = new MockObservableQueryConnection<string>();
        const disconnectSpy = sinon.spy(mockConnection, 'disconnect');

        // Spy on subscribe and return subscription with our spied connection
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            return new ObservableQuerySubscription(mockConnection);
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        type TestArgs = {
            value: string;
        };

        const { result, rerender } = renderHook(
            ({ args }) => useObservableQuery(
                constructorStub as unknown as Constructor<MockObservableQuery<string, TestArgs>>,
                args
            ),
            { initialProps: { args: { value: 'initial' } } }
        );

        // Let initial subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        expect(subscribeSpy.callCount).to.equal(1);

        // Change the arguments
        act(() => {
            rerender({ args: { value: 'updated' } });
        });

        // Let new subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Verify old subscription was cleaned up and new one created
        expect(disconnectSpy.called).to.be.true;
        expect(subscribeSpy.callCount).to.equal(2);
    });

    it('should handle subscription errors gracefully', async () => {
        console.log('Test starting');

        // Create instance and set up spy that throws
        const mockQuery = new MockObservableQuery<string>();
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').throws(new Error('Subscription failed'));

        const constructorStub = sinon.stub().returns(mockQuery);

        const { result } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Let subscription attempt
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Verify error was handled gracefully
        expect(subscribeSpy.called).to.be.true;
        expect(result.current.queryResult.data).to.equal("");
    });

    it('should handle rapid subscription changes correctly', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        const disconnectSpies: sinon.SinonSpy[] = [];

        // Spy on subscribe and create new connection for each subscription
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            const connection = new MockObservableQueryConnection<string>();
            const disconnectSpy = sinon.spy(connection, 'disconnect');
            disconnectSpies.push(disconnectSpy);
            return new ObservableQuerySubscription(connection);
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        type TestArgs = {
            value: string;
        };

        const { result, rerender } = renderHook(
            ({ args }) => useObservableQuery(
                constructorStub as unknown as Constructor<MockObservableQuery<string, TestArgs>>,
                args
            ),
            { initialProps: { args: { value: 'initial' } } }
        );

        // Let initial subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Change 1
        act(() => {
            rerender({ args: { value: 'change1' } });
        });
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Change 2
        act(() => {
            rerender({ args: { value: 'change2' } });
        });
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Change 3
        act(() => {
            rerender({ args: { value: 'change3' } });
        });
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Count actual disconnects (ignore duplicate calls)
        const actualDisconnects = disconnectSpies.filter(spy => spy.called).length;

        expect(actualDisconnects, 'Unexpected number of disconnects').to.equal(3); // One for each change
        expect(subscribeSpy.callCount, 'Unexpected number of subscribes').to.equal(4);  // Initial + 3 changes
    });

    it('should handle unmount during subscription setup', async () => {
        console.log('Test starting');

        // Create instance and set up spy with delayed subscription
        const mockQuery = new MockObservableQuery<string>();
        const mockConnection = new MockObservableQueryConnection<string>();
        const disconnectSpy = sinon.spy(mockConnection, 'disconnect');

        let resolveSubscription: () => void;
        const subscriptionPromise = new Promise<void>(resolve => {
            resolveSubscription = resolve;
        });

        // Spy on subscribe with delayed response
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            subscriptionPromise.then(() => {
                callback({ data: "test data" } as QueryResult<string>);
            });
            return new ObservableQuerySubscription(mockConnection);
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        const { result, unmount } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Start subscription setup
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Unmount before subscription completes
        act(() => {
            unmount();
        });

        // Complete subscription after unmount
        act(() => {
            resolveSubscription();
        });

        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Verify cleanup happened
        expect(disconnectSpy.called).to.be.true;
        expect(subscribeSpy.called).to.be.true;
    });

    it('should handle multiple data updates through subscription', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        let capturedCallback: OnNextResult<QueryResult<string>>;

        // Spy on subscribe and capture callback
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            capturedCallback = callback;
            return new ObservableQuerySubscription(new MockObservableQueryConnection());
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        const { result } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Let subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        expect(subscribeSpy.called).to.be.true;

        // Send first update
        act(() => {
            capturedCallback({ data: "update 1" } as QueryResult<string>);
        });
        expect(result.current.queryResult.data).to.equal("update 1");

        // Send second update
        act(() => {
            capturedCallback({ data: "update 2" } as QueryResult<string>);
        });
        expect(result.current.queryResult.data).to.equal("update 2");

        // Send third update
        act(() => {
            capturedCallback({ data: "update 3" } as QueryResult<string>);
        });
        expect(result.current.queryResult.data).to.equal("update 3");

        // Verify we still have just one subscription
        expect(subscribeSpy.callCount).to.equal(1);
    });

    it('should preserve state between renders with same props', async () => {
        console.log('Test starting');

        // Create instance and set up spy
        const mockQuery = new MockObservableQuery<string>();
        let capturedCallback: OnNextResult<QueryResult<string>>;

        // Spy on subscribe and capture callback
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            capturedCallback = callback;
            return new ObservableQuerySubscription(new MockObservableQueryConnection());
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        const { result, rerender } = renderHook(() => useObservableQuery(
            constructorStub as unknown as Constructor<MockObservableQuery<string, any>>
        ));

        // Let subscription set up
        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Send initial data
        act(() => {
            capturedCallback({ data: "test data" } as QueryResult<string>);
        });

        expect(result.current.queryResult.data).to.equal("test data");
        expect(subscribeSpy.callCount).to.equal(1);

        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Rerender with same props
        act(() => {
            rerender();
        });

        await act(async () => {
            await Promise.resolve();
            clock.tick(1);
        });

        // Verify state is preserved and no new subscription
        expect(result.current.queryResult.data).to.equal("test data");
        expect(subscribeSpy.callCount).to.equal(1);
    });

    it('should cleanup connections in all scenarios', async () => {
        console.log('Test starting');

        const mockConnections: MockObservableQueryConnection<string>[] = [];
        const disconnectSpies: sinon.SinonSpy[] = [];

        // Create instance and set up spy that tracks all connections
        const mockQuery = new MockObservableQuery<string>();
        subscribeSpy = sinon.stub(mockQuery, 'subscribe').callsFake((callback) => {
            console.log('Subscribe called');
            const connection = new MockObservableQueryConnection<string>();
            mockConnections.push(connection);
            const disconnectSpy = sinon.spy(connection, 'disconnect');
            disconnectSpies.push(disconnectSpy);
            return new ObservableQuerySubscription(connection);
        });

        const constructorStub = sinon.stub().returns(mockQuery);

        type TestArgs = {
            value: string;
        };

        // Scenario 1: Normal mount/unmount
        {
            const { unmount } = renderHook(() => useObservableQuery(
                constructorStub as unknown as Constructor<MockObservableQuery<string, TestArgs>>,
                { value: 'test1' }
            ));

            await act(async () => {
                await Promise.resolve();
                clock.tick(1);
            });

            unmount();
        }

        // Scenario 2: Multiple prop changes then unmount
        {
            const { rerender, unmount } = renderHook(
                ({ args }) => useObservableQuery(
                    constructorStub as unknown as Constructor<MockObservableQuery<string, TestArgs>>,
                    args
                ),
                { initialProps: { args: { value: 'test2-initial' } } }
            );

            await act(async () => {
                await Promise.resolve();
                clock.tick(1);
            });

            // Multiple prop changes
            for (let i = 1; i <= 3; i++) {
                act(() => {
                    rerender({ args: { value: `test2-change${i}` } });
                });
                await act(async () => {
                    await Promise.resolve();
                    clock.tick(1);
                });
            }

            unmount();
        }

        // Scenario 3: Rapid unmount during subscription setup
        {
            const { unmount } = renderHook(() => useObservableQuery(
                constructorStub as unknown as Constructor<MockObservableQuery<string, TestArgs>>,
                { value: 'test3' }
            ));

            // Immediate unmount
            unmount();
        }

        // Let any pending cleanup complete
        await act(async () => {
            await Promise.resolve();
            clock.tick(100);
        });

        // Verify all connections were cleaned up
        mockConnections.forEach((connection, index) => {
            expect(disconnectSpies[index].called,
                `Connection ${index} was not properly disconnected`
            ).to.be.true;
        });

        // Verify number of disconnects matches number of subscribes
        expect(disconnectSpies.filter(spy => spy.called).length,
            'Number of disconnects does not match number of connections'
        ).to.equal(subscribeSpy.callCount);
    });

    describe('subscription cleanup', () => {
        let mockQuery: MockObservableQuery<string>;
        let subscribeSpy: sinon.SinonStub;

        beforeEach(() => {
            mockQuery = new MockObservableQuery<string>();
            subscribeSpy = sinon.stub(mockQuery, 'subscribe');
        });

        afterEach(() => {
            subscribeSpy.restore();
        });

        it('should cleanup and set state when subscription fails', async () => {
            const mockConnection = new MockObservableQueryConnection<string>();
            const disconnectSpy = sinon.spy(mockConnection, 'disconnect');
            let capturedCallback: ((result: QueryResult<string>) => void) | null = null;

            subscribeSpy.callsFake((callback: (result: QueryResult<string>) => void) => {
                capturedCallback = callback;
                return new ObservableQuerySubscription(mockConnection);
            });

            class TestQuery extends MockObservableQuery<string> {
                constructor() {
                    super();
                    return mockQuery;
                }
            }

            const { result } = renderHook(() => useObservableQuery(
                TestQuery as Constructor<MockObservableQuery<string, any>>
            ));

            await act(async () => {
                await Promise.resolve();
                clock.tick(1);
            });

            expect(capturedCallback).to.not.be.null;

            await act(async () => {
                if (capturedCallback) {
                    capturedCallback({
                        data: '',
                        isSuccess: false,
                        isAuthorized: true,
                        isValid: true,
                        validationResults: [],
                        hasExceptions: true,
                        exceptionMessages: ['Subscription error'],
                        exceptionStackTrace: 'Error stack trace',
                        hasData: false
                    });
                }
                await Promise.resolve();
                clock.tick(1);
            });

            expect(result.current.queryResult.hasExceptions).to.be.true;
            expect(result.current.queryResult.exceptionMessages).to.deep.equal(['Subscription error']);
            expect(result.current.queryResult.hasData).to.be.false;
        });

        it('should cleanup when subscription setup throws', async () => {
            const mockConnection = new MockObservableQueryConnection<string>();
            const disconnectSpy = sinon.spy(mockConnection, 'disconnect');
            let setupAttempts = 0;

            subscribeSpy.callsFake(() => {
                setupAttempts++;
                if (setupAttempts === 1) {
                    throw new Error('Subscription setup failed');
                }
                return new ObservableQuerySubscription(mockConnection);
            });

            class TestQuery extends MockObservableQuery<string> {
                constructor() {
                    super();
                    return mockQuery;
                }
            }

            // Render with rerender capability and initial args
            const { result, rerender } = renderHook(
                ({ args }) => useObservableQuery(
                    TestQuery as Constructor<MockObservableQuery<string, any>>,
                    args
                ),
                { initialProps: { args: { value: 'initial' } } }
            );

            await act(async () => {
                await Promise.resolve();
                clock.tick(1);
            });

            expect(setupAttempts).to.equal(1);

            // Trigger new subscription attempt with different args
            await act(async () => {
                rerender({ args: { value: 'retry' } });
                await Promise.resolve();
                clock.tick(1);
            });

            expect(setupAttempts).to.equal(2);
        });
    });
});

class MockObservableQueryConnection<TDataType> implements IObservableQueryConnection<TDataType> {
    private _connected = false;
    private _disconnected = false;

    connect(dataReceived: DataReceived<TDataType>): void {
        if (this._disconnected) {
            throw new Error('Attempting to connect a disconnected connection');
        }
        this._connected = true;
    }

    disconnect(): void {
        if (this._disconnected) {
            throw new Error('Connection already disconnected');
        }
        this._connected = false;
        this._disconnected = true;
    }

    isConnected(): boolean {
        return this._connected && !this._disconnected;
    }

    wasProperlyDisconnected(): boolean {
        return this._disconnected;
    }
}

class MockObservableQuery<TDataType, TArguments = {}> implements IObservableQueryFor<TDataType, TArguments> {
    defaultValue: TDataType;
    route = '/mock';
    routeTemplate: Handlebars.TemplateDelegate<any> = Handlebars.compile(this.route);
    requestArguments: string[] = ['arg1', 'arg2'];

    constructor(defaultValue: TDataType = "" as unknown as TDataType) {
        this.defaultValue = defaultValue;
    }

    subscribe(callback: OnNextResult<QueryResult<TDataType>>, args?: TArguments): ObservableQuerySubscription<TDataType> {
        callback({ data: this.defaultValue } as QueryResult<TDataType>);
        return new ObservableQuerySubscription(new MockObservableQueryConnection());
    }
}