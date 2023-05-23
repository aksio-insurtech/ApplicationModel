// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

#pragma warning disable CS8019

global using Aksio.Applications.Commands;
global using Aksio.Applications.ModelBinding;
global using Aksio.Applications.Queries;
global using Aksio.Applications.Queries.MongoDB;
global using Aksio.Applications.Rules;
global using Aksio.Applications.Validation;
global using Aksio.Concepts;
global using Aksio.Events;
global using Aksio.EventSequences;
global using Aksio.EventSequences.Outbox;
global using Aksio.Integration;
global using Aksio.Models;
global using Aksio.Observation;
global using Aksio.Projections;
global using Aksio.Serialization;
global using AutoMapper;
global using FluentValidation;
global using Microsoft.AspNetCore.Mvc;
global using MongoDB.Driver;
