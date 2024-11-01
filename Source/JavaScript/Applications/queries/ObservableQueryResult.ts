import { QueryResultWithState } from "./QueryResultWithState";

export type ObservableQueryResult<TDataType> = {
    queryResult: QueryResultWithState<TDataType>;  // Represents the data and its state
    isSubscribed: boolean;                         // Indicates if the subscription is active
    unsubscribe: () => void;                       // Function to manually unsubscribe
};