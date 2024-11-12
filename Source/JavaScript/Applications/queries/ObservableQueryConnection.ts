// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IObservableQueryConnection } from './IObservableQueryConnection';
import { QueryResult } from './QueryResult';


export type DataReceived<TDataType> = (data: QueryResult<TDataType>) => void;

/**
 * Represents the connection for an observable query.
 */
export class ObservableQueryConnection<TDataType> implements IObservableQueryConnection<TDataType> {
    // Using null instead of undefined for explicit null checks
    private _socket: WebSocket | null = null;

    // Flag to track if disconnect was called
    private _disconnected = false;

    // Reference to cleanup function for reconnection attempts
    private _cleanup: (() => void) | null = null;

    constructor(private readonly _route: string) {}

    connect(dataReceived: DataReceived<TDataType>) {
        const secure = document.location.protocol.indexOf('https') === 0;
        const url = `${secure ? 'wss' : 'ws'}://${document.location.host}${this._route}`;

        let timeToWait = 500;
        const timeExponent = 500;
        const retries = 100;
        let currentAttempt = 0;

        // Store cleanup reference for cancelling reconnection attempts
        let reconnectTimeout: NodeJS.Timeout;

        const connectSocket = () => {
            const retry = () => {
                currentAttempt++;
                if (currentAttempt > retries) {
                    console.log(`Attempted ${retries} retries for route '${this._route}'. Abandoning.`);
                    return;
                }
                console.log(`Attempting to reconnect for '${this._route}' (#${currentAttempt})`);

                // Store timeout reference for cleanup
                reconnectTimeout = setTimeout(connectSocket, timeToWait);
                timeToWait += (timeExponent * currentAttempt);
            };

            // Only create new socket if not disconnected
            if (!this._disconnected) {
                this._socket = new WebSocket(url);

                this._socket.onopen = (ev) => {
                    console.debug(`Connection for '${this._route}' established`);
                    timeToWait = 500;
                    currentAttempt = 0;
                };

                this._socket.onclose = (ev) => {
                    // Only retry if not manually disconnected
                    if (!this._disconnected) {
                        console.log(`Unexpected connection closed for route '${this._route}`);
                        retry();
                    }
                };

                this._socket.onerror = (error) => {
                    console.log(`Error with connection for '${this._route} - ${JSON.stringify(error)}`);
                    retry();
                };

                this._socket.onmessage = (ev) => {
                    dataReceived(JSON.parse(ev.data));
                };
            }
        };

        // Store cleanup function for reconnection attempts
        this._cleanup = () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };

        connectSocket();
    }

    disconnect() {
        if (this._socket && !this._disconnected) {
            console.debug(`Disconnecting '${this._route}'`);
            this._disconnected = true;

            // Clear any pending reconnection attempts
            if (this._cleanup) {
                this._cleanup();
                this._cleanup = null;
            }

            try {
                this._socket.close();
                this._socket = null;
            } catch (error) {
                console.error(`Error closing socket for '${this._route}':`, JSON.stringify(error));
            }
        }
    }
}