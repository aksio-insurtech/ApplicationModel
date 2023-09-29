// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Aksio.Applications.Identity.for_IdentityProviderEndpoint.given;

public abstract class a_valid_identity_request : an_identity_provider_endpoint
{
    protected string identity_id = "123";
    protected string identity_name = "Test User";
    protected IdentityProviderContext identity_provider_context;
    protected IdentityDetails details_result = new(true, "Hello world");
    protected ClientPrincipal client_principal;

    void Establish()
    {
        headers.Setup(_ => _.ContainsKey(MicrosoftIdentityPlatformHeaders.IdentityIdHeader)).Returns(true);
        headers.Setup(_ => _.ContainsKey(MicrosoftIdentityPlatformHeaders.IdentityNameHeader)).Returns(true);
        headers.Setup(_ => _.ContainsKey(MicrosoftIdentityPlatformHeaders.PrincipalHeader)).Returns(true);

        headers.SetupGet(_ => _[MicrosoftIdentityPlatformHeaders.IdentityIdHeader]).Returns("123");
        headers.SetupGet(_ => _[MicrosoftIdentityPlatformHeaders.IdentityNameHeader]).Returns("Test User");

        client_principal = CreateClientPrincipal();
        headers
            .SetupGet(_ => _[MicrosoftIdentityPlatformHeaders.PrincipalHeader])
            .Returns(() => Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(client_principal)));

        identity_provider.Setup(_ => _.Provide(IsAny<IdentityProviderContext>())).Returns((IdentityProviderContext context) =>
        {
            identity_provider_context = context;
            return Task.FromResult(details_result);
        });
    }

    protected virtual ClientPrincipal CreateClientPrincipal()
    {
        return new()
        {
            auth_type = "aad",
            claims = new[]
            {
                new ClientPrincipalClaim { typ = "roles", val = "role1" },
                new ClientPrincipalClaim { typ = "roles", val = "role2" }
            },
            name_typ = "name",
            role_typ = "roles"
        };
    }
}