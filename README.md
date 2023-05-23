# Aksio Application Model

## Packages / Deployables

[![Nuget](https://img.shields.io/nuget/v/Aksio.Applications?logo=nuget)](http://nuget.org/packages/aksio.applications)
[![NPM](https://img.shields.io/npm/v/@aksio/applications?label=@aksio/applications&logo=npm)](https://www.npmjs.com/package/@aksio/applications)

## Builds

[![.NET Build](https://github.com/aksio-insurtech/Fundamentals/actions/workflows/dotnet-build.yml/badge.svg)](https://github.com/aksio-insurtech/Fundamentals/actions/workflows/dotnet-build.yml)
[![JavaScript Build](https://github.com/aksio-insurtech/Fundamentals/actions/workflows/javascript-build.yml/badge.svg)](https://github.com/aksio-insurtech/Fundamentals/actions/workflows/javascript-build.yml)

## Description

The Aksio Application model represents an opinionated approach to building consistent applications based on the concepts behind CQRS.
It offers extensions for different frameworks and is built on top of ASP.NET Core. One of the traits the application model has is the
bridging between the backend and the frontend. The application model provides a tool, called **ProxyGenerator** that hooks into the
C# Roslyn compiler and generates TypeScript code for recognized artifacts matching the criteria of what is considered a **commmand** or
a **query**.

## Central Package Management

This repository leverages [Central Package Management](https://learn.microsoft.com/en-us/nuget/consume-packages/Central-Package-Management), which
means that all package versions are managed from a file at the root level called [Directory.Packages.props](./Directory.Packages.props).

In addition there are also [Directory.Build.props](https://learn.microsoft.com/en-us/visualstudio/msbuild/customize-by-directory?view=vs-2022#directorybuildprops-and-directorybuildtargets) files for
setting up common settings that are applied cross cuttingly.