// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultWithState } from "./QueryResultWithState";

export type ObservableQueryResult<TDataType> = {
    queryResult: QueryResultWithState<TDataType>;  // Represents the data and its state
    unsubscribe: () => void;                       // Function to manually unsubscribe
};