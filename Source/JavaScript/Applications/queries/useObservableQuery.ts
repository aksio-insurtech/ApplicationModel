// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultWithState } from './QueryResultWithState';
import { IObservableQueryFor } from './IObservableQueryFor';
import { Constructor } from '@aksio/fundamentals';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ObservableQueryResult } from './ObservableQueryResult';

const EMPTY_ARGS = {} as const;

/**
 * React hook for working with {@link IObservableQueryFor} within the state management of React.
 * @template TDataType Type of model the query is for.
 * @template TQuery Type of observable query to use.
 * @template TArguments Optional: Arguments for the query, if any
 * @param query Query type constructor.
 * @param args Arguments for the query, defaulting to an empty object
 * @returns {@link ObservableQueryResult}.
 */
export function useObservableQuery<TDataType, TQuery extends IObservableQueryFor<TDataType>, TArguments = {}>(
    query: Constructor<TQuery>,
    args: TArguments = EMPTY_ARGS as TArguments
): ObservableQueryResult<TDataType> {
    const stableArgs = useMemo(() => args, [JSON.stringify(args)]);
    const queryInstance = useMemo(() => new query() as TQuery, [query]);
    const [result, setResult] = useState<QueryResultWithState<TDataType>>(
        QueryResultWithState.initial(queryInstance.defaultValue)
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
    const cleanupInProgressRef = useRef(false);

    const cleanupSubscription = useCallback(() => {
        if (cleanupInProgressRef.current) {
            return; // Prevent duplicate cleanup
        }

        if (subscriptionRef.current) {
            try {
                cleanupInProgressRef.current = true;
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                setIsSubscribed(false);
            } catch (error) {
                console.error("Error during unsubscription: ", error);
            } finally {
                cleanupInProgressRef.current = false;
            }
        }
    }, []);

    useEffect(() => {
        let isComponentMounted = true;

        const setupSubscription = async () => {
            try {
                // Clean up any existing subscription first
                cleanupSubscription();

                // Only proceed if component is still mounted
                if (!isComponentMounted) return;

                const subscription = queryInstance.subscribe(response => {
                    if (isComponentMounted) {
                        setResult(QueryResultWithState.fromQueryResult(response, false));

                        // Cleanup subscription if we receive an error response
                        if (!response.isSuccess || response.hasExceptions) {
                            cleanupSubscription();
                        }
                    }
                }, args as any);

                // Only set the subscription if component is mounted
                if (isComponentMounted) {
                    subscriptionRef.current = subscription;
                    setIsSubscribed(true);
                } else {
                    // If component unmounted, cleanup this subscription
                    subscription.unsubscribe();
                }
            } catch (error) {
                console.error('Error during subscription:', error);
                if (isComponentMounted) {
                    setIsSubscribed(false);
                }
            }
        };

        setupSubscription();

        return () => {
            isComponentMounted = false;
            cleanupSubscription();
        };
    }, [queryInstance, stableArgs, cleanupSubscription]);

    return { queryResult: result, isSubscribed, unsubscribe: cleanupSubscription };
}