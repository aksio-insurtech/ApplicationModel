// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Collections.Immutable;
using System.Security.Claims;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http;

namespace Aksio.Applications.Identity;

/// <summary>
/// Extensions for <see cref="HttpRequest"/> for Microsoft Identity Platform.
/// </summary>
public static class MicrosoftIdentityPlatformRequestExtensions
{
    /// <summary>
    /// Get the claims from the request.
    /// </summary>
    /// <param name="request"><see cref="HttpRequest"/> to get from.</param>
    /// <returns>Collection of key / value with claims.</returns>
    public static IImmutableList<Claim> GetClaims(this HttpRequest request)
    {
        var token = Convert.FromBase64String(request.Headers[MicrosoftIdentityPlatformHeaders.PrincipalHeader].ToString());
        var tokenAsJson = JsonNode.Parse(token) as JsonObject;
        var claims = new List<Claim>();
        if (tokenAsJson is not null && tokenAsJson.TryGetPropertyValue("claims", out var claimsArray) && claimsArray is JsonArray claimsAsArray)
        {
            foreach (var claim in claimsAsArray.Cast<JsonObject>())
            {
                if (claim.TryGetPropertyValue("typ", out var type) &&
                    claim.TryGetPropertyValue("val", out var value))
                {
                    claims.Add(new Claim(type!.ToString(), value!.ToString()));
                }
            }
        }

        return claims.ToImmutableList();
    }
}