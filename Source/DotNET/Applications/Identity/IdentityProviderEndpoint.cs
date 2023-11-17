// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http;

namespace Aksio.Applications.Identity;

/// <summary>
/// Represents the actual endpoint called for identity details (/.aksio/me).
/// </summary>
public class IdentityProviderEndpoint
{
    readonly JsonSerializerOptions _serializerOptions;
    readonly IProvideIdentityDetails _identityProvider;

    /// <summary>
    /// Initializes a new instance of the <see cref="IdentityProviderEndpoint"/> class.
    /// </summary>
    /// <param name="serializerOptions"><see cref="JsonSerializerOptions"/> to use for serialization.</param>
    /// <param name="identityProvider"><see cref="IProvideIdentityDetails"/> for providing the identity.</param>
    public IdentityProviderEndpoint(JsonSerializerOptions serializerOptions, IProvideIdentityDetails identityProvider)
    {
        _serializerOptions = new JsonSerializerOptions(serializerOptions)
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        _identityProvider = identityProvider;
    }

    /// <summary>
    /// Handle the identity request.
    /// </summary>
    /// <param name="request"><see cref="HttpRequest"/> that holds all the request information.</param>
    /// <param name="response"><see cref="HttpResponse"/> that will be written to.</param>
    /// <returns>Awaitable task.</returns>
    public async Task Handler(HttpRequest request, HttpResponse response)
    {
        if (HasValidIdentityHeaders(request))
        {
            IdentityId identityId = request.Headers[MicrosoftIdentityPlatformHeaders.IdentityIdHeader].ToString();
            IdentityName identityName = request.Headers[MicrosoftIdentityPlatformHeaders.IdentityNameHeader].ToString();
            var token = Convert.FromBase64String(request.Headers[MicrosoftIdentityPlatformHeaders.PrincipalHeader].ToString());
            var tokenAsJson = JsonNode.Parse(token) as JsonObject;

            if (TryGetClaims(tokenAsJson, out var claimsAsArray))
            {
                var claims = request.GetClaims().Select(claim => new KeyValuePair<string, string>(claim.Type, claim.Value));

                var context = new IdentityProviderContext(identityId, identityName, tokenAsJson!, claims);
                var result = await _identityProvider.Provide(context);

                if (result.IsUserAuthorized)
                {
                    response.StatusCode = 200;
                }
                else
                {
                    response.StatusCode = 403;
                }

                response.ContentType = "application/json; charset=utf-8";
                await response.WriteAsJsonAsync(result.Details, _serializerOptions);
            }
        }
    }

    bool HasValidIdentityHeaders(HttpRequest request) =>
        request.Headers.ContainsKey(MicrosoftIdentityPlatformHeaders.IdentityIdHeader) &&
        request.Headers.ContainsKey(MicrosoftIdentityPlatformHeaders.IdentityNameHeader) &&
        request.Headers.ContainsKey(MicrosoftIdentityPlatformHeaders.PrincipalHeader);

    bool TryGetClaims(JsonObject? tokenAsJson, out JsonArray claims)
    {
        if (tokenAsJson is not null &&
            tokenAsJson.TryGetPropertyValue("claims", out var claimsArray) &&
            claimsArray is JsonArray claimsAsArray)
        {
            claims = claimsAsArray;
            return true;
        }

        claims = new JsonArray();
        return false;
    }
}
