# [v1.8.2] - 2024-11-8 [PR: #88](https://github.com/aksio-insurtech/ApplicationModel/pull/88)

Look for the interface rather than the concrete type.  Allows client implementations to be generated.


# [v1.8.1] - 2024-11-4 [PR: #87](https://github.com/aksio-insurtech/ApplicationModel/pull/87)

It was the wrong enumerable that was removed first time.  Still need the branching. :-(

# [v1.8.0] - 2024-11-4 [PR: #86](https://github.com/aksio-insurtech/ApplicationModel/pull/86)

Forgot to add a label to publish a new version. 

# [v1.7.2] - 2024-11-3 [PR: #84](https://github.com/aksio-insurtech/ApplicationModel/pull/84)

useObservableQuery now always returns an object, never an enumerable.

# [v1.7.1] - 2024-11-1 [PR: #83](https://github.com/aksio-insurtech/ApplicationModel/pull/83)

Return ObservableQueryResult from an ObservableQuery.


# [v1.7.0] - 2024-11-1 [PR: #82](https://github.com/aksio-insurtech/ApplicationModel/pull/82)

To avoid the broken ToCamelCase implementation.  Added the tests to ensure we don't use the ACRONYM based ToCamelCase (It breaks all the existing read models, etc).

# [v1.6.0] - 2024-11-1 [PR: #81](https://github.com/aksio-insurtech/ApplicationModel/pull/81)

## Summary

Summary of the PR here. The GitHub release description is created from this comment so keep it nice and descriptive.
Remember to remove sections that you don't need or use.
If it does not make sense to have a summary, you can take that out as well.

### Added

- Describe the added features

### Changed

- Describe the outwards facing code change

### Fixed

- Describe the fix and the bug

### Removed

- Describe what was removed and why

### Security

- Describe the security issue and the fix

### Deprecated

- Describe the part of the code being deprecated and why


# [v1.5.9] - 2024-1-12 [PR: #80](https://github.com/aksio-insurtech/ApplicationModel/pull/80)

### Fixed

- Fixing so that if a client fetches from the same query multiple times and the response could potentialle come out of order, we make sure to cancel any ongoing requests.
- Adding a cancellation token for `ObservableClient` queries that we pass along to every WebSocket operation in case the client disconnects.


# [v1.5.8] - 2023-12-15 [PR: #79](https://github.com/aksio-insurtech/ApplicationModel/pull/79)

## Summary

Update fundamentals to 1.6.1 to get the new ToCamelCase method

This is especially needed for the Proxy Generation.

# [v1.5.7] - 2023-12-14 [PR: #78](https://github.com/aksio-insurtech/ApplicationModel/pull/78)

### Fixed

- `OnNext()` was never called on the observable given to the `MongoDBCollectionExtensions` when observing changes for `ClientObservables`.


# [v1.5.6] - 2023-12-13 [PR: #77](https://github.com/aksio-insurtech/ApplicationModel/pull/77)

### Fixed

- Handling exceptions if serialization to UTF8 for the WebSocket connections.
- Printing any exceptions that occur during serialization or sending data to client over WebSockets.


# [v1.5.5] - 2023-12-11 [PR: #76](https://github.com/aksio-insurtech/ApplicationModel/pull/76)

### Fixed

- Upgrading `Aksio.Fundamentals` to the latest version.


# [v1.5.4] - 2023-12-7 [PR: #75](https://github.com/aksio-insurtech/ApplicationModel/pull/75)

### Fixed

- Removing response compression since we've removed all compression from the application model. Without this removed, an application will crash if it doesn't have compression configured.


# [v1.5.3] - 2023-11-29 [PR: #74](https://github.com/aksio-insurtech/ApplicationModel/pull/74)

### Fixed

- Fixing the `.Observe()` method for a collection of items to remove items that have a MongoDB change stream update of delete.


# [v1.5.2] - 2023-11-29 [PR: #73](https://github.com/aksio-insurtech/ApplicationModel/pull/73)

### Fixed

- Adding `delete` to the change stream filter for `.Observer()` on Mongo collections.


# [v1.5.1] - 2023-11-25 [PR: #72](https://github.com/aksio-insurtech/ApplicationModel/pull/72)

### Fixed

- Fixing the `OnNextResult` generic definition. It didn't include the generic parameter properly and forcing one to have to cast the result to `QueryResult<TDataType>`. Now it will be correct data type.


# [v1.5.0] - 2023-11-17 [PR: #71](https://github.com/aksio-insurtech/ApplicationModel/pull/71)

## Changed

- Asp.Net compression was on by default, this is now removed as it makes some static file serving very slow.
Non-braeking NuGet packages was also updated.

# [v1.4.2] - 2023-10-17 [PR: #70](https://github.com/aksio-insurtech/ApplicationModel/pull/70)

### Fixed

- Adding support for `ControllerBase` as the base of a controller when generating proxies, which is more natural for APIs.


# [v1.4.1] - 2023-10-2 [PR: #68](https://github.com/aksio-insurtech/ApplicationModel/pull/68)

### Fixed

- The previous version crashed on startup if used in a solution without an identity provider.



# [v1.4.0] - 2023-10-2 [PR: #67](https://github.com/aksio-insurtech/ApplicationModel/pull/67)

### Fixed

- 1.3.1 broke startup for projects that implemented IProvideIdentityDetails, by resolving the service during startup - before it was ready.
- This fixes that by instead using IServiceProviderIsService.IsService() to only determine if a IProvideIdentityDetails has been registered.

# [v1.3.1] - 2023-9-29 [PR: #66](https://github.com/aksio-insurtech/ApplicationModel/pull/66)

### Fixed

- Fixing the `IdentityProviderEndpoint` to handle multiple claims with same type.
- Refactoring `IdentityProviderEndpoint` and setup to be more testable.
- Added specs for `IdentityProviderEndpoint` and setup code.


# [v1.3.0] - 2023-9-28 [PR: #65](https://github.com/aksio-insurtech/ApplicationModel/pull/65)

### Added

- UseDefaultLogging() method for WebApplicationBuilder


# [v1.2.2] - 2023-9-25 [PR: #64](https://github.com/aksio-insurtech/ApplicationModel/pull/64)

### Fixed

- Fixed `ObservableQueryFor` and `QueryFor` for frontend to make sure it returns an array for enumerable types, even if the server returns an object. It will set it to an empty array if that is the case. That way it is consistently the correct type at least.


# [v1.2.1] - 2023-9-14 [PR: #63](https://github.com/aksio-insurtech/ApplicationModel/pull/63)

### Fixed

- Changed the automatic hookup of assembly parts that holds controllers to discover based on implementations of `ControllerBase` and not `Controller`, which is more accurate as pure API controllers should inherit from `ControllerBase`.


# [v1.2.0] - 2023-9-6 [PR: #62](https://github.com/aksio-insurtech/ApplicationModel/pull/62)

### Added

- Added a middleware that gets added early to take `x-ms-client-principal*` headers and populate a `ClaimsPrinipal` and `ClaimsIdentity` with all the claims and make it available on the `Request.User` property.


# [v1.1.19] - 2023-9-4 [PR: #61](https://github.com/aksio-insurtech/ApplicationModel/pull/61)

### Fixed

- Proxy generator will now ignore any ASP.NET controller actions marked with `[AspNetResult]` attribute, as intended.


# [v1.1.18] - 2023-8-30 [PR: #60](https://github.com/aksio-insurtech/ApplicationModel/pull/60)

### Fixed

- Proxy generator is now more forgiving on dictionaries where key is not a string. It will now give a warning rather than error and include the route of the API it was coming from and also then set the type to be `any` as it doesn't know what to do. Ultimately this should be a `Map<,>`, but that entails adding support for that type in the JSON JavaScript serializer in Fundamentals.


# [v1.1.17] - 2023-8-22 [PR: #59](https://github.com/aksio-insurtech/ApplicationModel/pull/59)

### Fixed

- Fixing so that dictionary types are outputted as object literals with type definition for key & value (supports only string keys) in proxy generator.
- Fixing so that types can properties of type referencing themselves - recursiveness.


# [v1.1.16] - 2023-8-21 [PR: #58](https://github.com/aksio-insurtech/ApplicationModel/pull/58)

### Fixed

- Await the result of the query when doing a refresh. The operation is async.


# [v1.1.15] - 2023-8-19 [PR: #57](https://github.com/aksio-insurtech/ApplicationModel/pull/57)

### Fixed

- Fixing proxy generator to sanitize paths for commands and queries to avoid multiple forward slashes. This improves import statements by removing unnecessary additional navigation.
- Fixing a bug in the proxy generator when types had reference to itself, it mistaked this as a potential type conflict.


# [v1.1.14] - 2023-7-25 [PR: #56](https://github.com/aksio-insurtech/ApplicationModel/pull/56)

### Fixed

- Adding trace logging for seeing WebSocket HTTP headers for debugging purposes.


# [v1.1.13] - 2023-7-25 [PR: #55](https://github.com/aksio-insurtech/ApplicationModel/pull/55)

### Fixed

- Removing `.UseWebSockets()` call from the `.UseAksio()` extension method, as this needs to be explicitly called from the applications themselves in the right order.


# [v1.1.12] - 2023-7-18 [PR: #49](https://github.com/aksio-insurtech/ApplicationModel/pull/49)

### Fixed

- Upgrade Fundamentals


# [v1.1.11] - 2023-7-18 [PR: #48](https://github.com/aksio-insurtech/ApplicationModel/pull/48)

### Fixed

- Upgrade Fundamentals


# [v1.1.10] - 2023-7-18 [PR: #47](https://github.com/aksio-insurtech/ApplicationModel/pull/47)

### Fixed

- Upgrade Fundamentals


# [v1.1.9] - 2023-7-18 [PR: #46](https://github.com/aksio-insurtech/ApplicationModel/pull/46)

### Fixed

- Upgrade Fundamentals


# [v1.1.8] - 2023-7-14 [PR: #45](https://github.com/aksio-insurtech/ApplicationModel/pull/45)

### Fixed

- Upgraded Fundamentals


# [v1.1.7] - 2023-7-12 [PR: #44](https://github.com/aksio-insurtech/ApplicationModel/pull/44)

### Fixed

- Removing the `MicroserviceId` and `MicroserviceName` from the `.UseAksio()` setup call. These were optional and not used for anything.


# [v1.1.6] - 2023-7-11 [PR: #43](https://github.com/aksio-insurtech/ApplicationModel/pull/43)

### Fixed

- Upgraded Aksio Fundamentals


# [v1.1.5] - 2023-7-11 [PR: #42](https://github.com/aksio-insurtech/ApplicationModel/pull/42)

### Fixed

- Taking out the use of `ModuleInitializer`, turns out the compiler warning about using it in a package was there for a good reason, it doesn't really work, at least not in production environment.


# [v1.1.4] - 2023-7-10 [PR: #41](https://github.com/aksio-insurtech/ApplicationModel/pull/41)

### Fixed

- Fixed null reference exception for duplicate `SendAsync` call caused by an error during merging.


# [v1.1.3] - 2023-7-10 [PR: #40](https://github.com/aksio-insurtech/ApplicationModel/pull/40)

### Fixed

- Improved performance related to MongoDB watching.
- Made watching more reliable, if it crashes it shouldn't take down the process with it.
- Removed quite a few memory leaks related to MongoDB watching.



# [v1.1.2] - 2023-6-20 [PR: #0]()

No release notes

# [v1.1.1] - 2023-6-20 [PR: #39](https://github.com/aksio-insurtech/ApplicationModel/pull/39)

### Fixed

- Upgraded Fundamentals


# [v1.1.0] - 2023-6-20 [PR: #38](https://github.com/aksio-insurtech/ApplicationModel/pull/38)

### Added

- Adding the possibility to exclude types by their namespace in the Autofac `SelfBindingRegistrationSource`.



# [v1.0.12] - 2023-6-16 [PR: #0]()

No release notes

# [v1.0.11] - 2023-6-14 [PR: #37](https://github.com/aksio-insurtech/ApplicationModel/pull/37)

### Fixed

- Adding a `ModuleInitializer` to perform all the exclusion of assemblies for the type discovery system.


# [v1.0.10] - 2023-6-14 [PR: #36](https://github.com/aksio-insurtech/ApplicationModel/pull/36)

### Fixed

- Upgrading to latest **Fundamentals** and leveraging its global instance of `Types` and `DerivedTypes`.


# [v1.0.9] - 2023-6-11 [PR: #0]()

No release notes

# [v1.0.8] - 2023-6-10 [PR: #0]()

No release notes

# [v1.0.7] - 2023-6-10 [PR: #0]()

No release notes

# [v1.0.6] - 2023-6-9 [PR: #0]()

No release notes

# [v1.0.5] - 2023-5-30 [PR: #31](https://github.com/aksio-insurtech/ApplicationModel/pull/31)

### Added

- Serilog project - separating out specific Serilog artifacts.

### Fixed

- How we use the Types system from Fundamentals after its API change.

# [v1.0.4] - 2023-5-25 [PR: #0]()

No release notes

# [v1.0.2] - 2023-5-25 [PR: #0]()

No release notes

# [v1.0.1] - 2023-5-25 [PR: #0]()

No release notes

# [v1.0.0] - 2023-5-25 [PR: #0]()

No release notes

# [v0.0.11] - 2023-5-24 [PR: #0]()

No release notes

# [v0.0.10] - 2023-5-24 [PR: #0]()

No release notes

# [v0.0.9] - 2023-5-24 [PR: #0]()

No release notes

# [v0.0.8] - 2023-5-24 [PR: #0]()

No release notes

# [v0.0.7] - 2023-5-23 [PR: #0]()

No release notes

# [v0.0.6] - 2023-5-23 [PR: #0]()

No release notes

# [v0.0.5] - 2023-5-23 [PR: #0]()

No release notes

# [v0.0.3] - 2023-5-23 [PR: #0]()

No release notes

# [v0.0.2] - 2023-5-23 [PR: #0]()

No release notes

# [v0.0.1] - 2023-5-23 [PR: #0]()

No release notes

