// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultWithState } from './QueryResultWithState';
import { IObservableQueryFor } from './IObservableQueryFor';
import { Constructor } from '@aksio/fundamentals';
import { useState, useEffect, useMemo, useRef } from 'react';
import { QueryResult } from './QueryResult';

/**
 * React hook for working with {@link IObservableQueryFor} within the state management of React.
 * @template TDataType Type of model the query is for.
 * @template TQuery Type of observable query to use.
 * @template TArguments Optional: Arguments for the query, if any
 * @param query Query type constructor.
 * @returns Tuple of {@link QueryResult} and boolean showing if it is Subscribed a tidy up unsubscribe delegate.
 */
export function useObservableQuery<TDataType, TQuery extends IObservableQueryFor<TDataType>, TArguments = {}>(
    query: Constructor<TQuery>,
    args?: TArguments
): [QueryResultWithState<TDataType>, boolean, () => void] {
    const queryInstance = useMemo(() => new query() as TQuery, [query]); // Memoize queryInstance
    const [result, setResult] = useState<QueryResultWithState<TDataType>>(
        QueryResultWithState.empty(queryInstance.defaultValue)
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);  // useRef to store subscription

    const argumentsDependency = useMemo(() => queryInstance.requestArguments.map(arg => args?.[arg]), [args]);

    // Helper function to clean up the subscription
    const cleanupSubscription = (calledManually: boolean) => {
        if(calledManually)
            console.log("Client Observable Query cleanup called manually...");

        if (isSubscribed && subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;  // Clear subscription reference
            setIsSubscribed(false);
        }
    };

    useEffect(() => {
        let isComponentMounted = true;

        // IIFE for async subscription
        (async () => {
            try {
                console.log("Subscribing to query...");

                // Call `subscribe` and immediately store the subscription reference
                const subscription = queryInstance.subscribe(response => {
                    console.log("Called subscribe...");
                    if (isComponentMounted) {
                        console.log("setting result...", result);
                        setResult(QueryResultWithState.fromQueryResult(response, false));
                    }
                }, args as any);
                setIsSubscribed(true);

                // Log to confirm the subscription object
                console.log("Subscription created:", subscription);

                // Immediately store the subscription in ref and set `isSubscribed` to true
                subscriptionRef.current = subscription;
            } catch (error) {
                console.error('Error during subscription:', error);
                setIsSubscribed(false);
            }
        })();

        // Cleanup function to handle unsubscription on unmount or dependency change
        return () => {
            console.log("Client Observable Query cleanup from useEffect...");
            isComponentMounted = false;
            cleanupSubscription(false);
        };
    }, [query, ...argumentsDependency]);

    const unsubscribe = () => {
        cleanupSubscription(true);
    };

    return [result, isSubscribed, unsubscribe];
}