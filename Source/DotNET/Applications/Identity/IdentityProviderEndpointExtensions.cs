// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Aksio.Applications.Identity;
using Aksio.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.AspNetCore.Builder;

/// <summary>
/// Extension methods for setting up identity providers.
/// </summary>
public static class IdentityProviderEndpointExtensions
{
    /// <summary>
    /// Add a identity provider to the service collection.
    /// </summary>
    /// <param name="services"><see cref="IServiceCollection"/> to add to.</param>
    /// <param name="types"><see cref="ITypes"/> for discovering identity provider.</param>
    /// <returns><see cref="IServiceCollection"/> for continuation.</returns>
    /// <exception cref="MultipleIdentityDetailsProvidersFound">Thrown if multiple identity details providers are found.</exception>
    public static IServiceCollection AddIdentityProvider(this IServiceCollection services, ITypes types)
    {
        var providerTypes = types.FindMultiple<IProvideIdentityDetails>().ToArray();
        if (providerTypes.Length > 1)
        {
            throw new MultipleIdentityDetailsProvidersFound(providerTypes);
        }

        if (providerTypes.Length == 1)
        {
            services.AddSingleton(typeof(IProvideIdentityDetails), providerTypes[0]);
        }

        return services;
    }

    /// <summary>
    /// Map identity provider endpoints.
    /// </summary>
    /// <param name="endpoints">Endpoints to extend.</param>
    /// <param name="app"><see cref="IApplicationBuilder"/> adding to.</param>
    /// <returns>Continuation.</returns>
    /// <exception cref="MultipleIdentityDetailsProvidersFound">Thrown if multiple identity details providers are found.</exception>
    public static IEndpointRouteBuilder MapIdentityProvider(this IEndpointRouteBuilder endpoints, IApplicationBuilder app)
    {
        var serviceProviderIsService = app.ApplicationServices.GetService<IServiceProviderIsService>();
        if (serviceProviderIsService!.IsService(typeof(IProvideIdentityDetails)))
        {
            endpoints.MapGet(
                ".aksio/me",
                (HttpRequest request, HttpResponse response) =>
                    app.ApplicationServices.GetService<IdentityProviderEndpoint>()!.Handler(request, response));
        }

        return endpoints;
    }
}
