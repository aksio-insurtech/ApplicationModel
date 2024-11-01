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
    // Memoize queryInstance only on changes to `query` (and `args` if necessary)
    const stableArgs = useMemo(() => args, [JSON.stringify(args)]);
    const queryInstance = useMemo(() => new query() as TQuery, [query]);
    const [result, setResult] = useState<QueryResultWithState<TDataType>>(
        QueryResultWithState.initial(queryInstance.defaultValue)
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

    const cleanupSubscription = () => {
        if(!subscriptionRef.current)
        {
            console.log("CleanUp: No subscription to clean up.");
            return;
        }

        try {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
            setIsSubscribed(false);
        } catch (error) {
            console.error("Error during unsubscription: ", error);
        }
    };

    const unsubscribe = () => {
        console.error("Manual unsubscribe requested...");
        cleanupSubscription();
    };

    // Track previous values of dependencies
    const prevQueryInstance = useRef(queryInstance);
    const prevArgs = useRef(args);

    useEffect(() => {
        // Check which dependency triggered the effect
        if (prevQueryInstance.current !== queryInstance) {
            console.log("queryInstance changed");
        }
        if (prevArgs.current !== args) {
            console.log("args changed");
        }
        // Update refs to the current values
        prevQueryInstance.current = queryInstance;
        prevArgs.current = args;
        let isComponentMounted = true;
        (async () => {
            try {
                console.log("Subscribing to observable query...");
                const subscription = queryInstance.subscribe(response => {
                    if (isComponentMounted) {
                        setResult(QueryResultWithState.fromQueryResult(response, false));
                    }
                }, args as any);
                subscriptionRef.current = subscription;
                setIsSubscribed(true);
            } catch (error) {
                console.error('Error during subscription:', error);
                setIsSubscribed(false);
            }
        })();

        return () => {
            console.log("Automatically Unsubscribing from observable query...");
            isComponentMounted = false;
            cleanupSubscription();
        };
    }, [query, stableArgs]);

    return { queryResult: result, isSubscribed, unsubscribe };
}