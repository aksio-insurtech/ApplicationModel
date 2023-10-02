// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Aksio.Applications.Identity.for_IdentityProviderEndpointExtensions.when_adding_identity_provider;

public class and_there_are_no_providers : Specification
{
    Mock<IServiceCollection> services;
    Mock<ITypes> types;

    void Establish()
    {
        services = new();
        types = new();
    }

    void Because() => services.Object.AddIdentityProvider(types.Object);

    [Fact] void should_not_add_service_registration() => services.Verify(_ => _.Add(IsAny<ServiceDescriptor>()), Never);
}