// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Concepts.AccountHolders;

namespace Events.AccountHolders;

[EventType("48447c3e-f99e-449f-80c6-15425859ce61")]
public record AccountHolderRegistered(string FirstName, string LastName, DateOnly DateOfBirth, Address Address, string SocialSecurityNumber);
