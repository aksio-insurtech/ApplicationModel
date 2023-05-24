// Copyright (c) Aksio Insurtech. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Reflection;
using Aksio.Execution;
using Aksio.Reflection;
using Autofac.Builder;
using Autofac.Core;

namespace Aksio.Applications.Autofac;

/// <summary>
/// Provides registrations on-the-fly for any concrete type not already registered with
/// the container.
/// </summary>
/// <remarks>
/// Based on https://raw.githubusercontent.com/autofac/Autofac/develop/src/Autofac/Features/ResolveAnything/AnyConcreteTypeNotAlreadyRegisteredSource.cs.
/// </remarks>
public class SelfBindingRegistrationSource : IRegistrationSource
{
    readonly Func<Type, bool> _predicate;

    /// <summary>
    /// Gets a value indicating whether the registrations provided by this source are 1:1 adapters on top
    /// of other components (e.g., Meta, Func, or Owned).
    /// </summary>
    public bool IsAdapterForIndividualComponents => false;

    /// <summary>
    /// Gets or sets an expression used to configure generated registrations.
    /// </summary>
    /// <value>
    /// A <see cref="Action{T}"/> that can be used to modify the behavior
    /// of registrations that are generated by this source.
    /// </value>
    public Action<IRegistrationBuilder<object, ConcreteReflectionActivatorData, SingleRegistrationStyle>>? RegistrationConfiguration { get; set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="SelfBindingRegistrationSource"/> class.
    /// </summary>
    public SelfBindingRegistrationSource()
        : this(_ => true)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="SelfBindingRegistrationSource"/> class.
    /// </summary>
    /// <param name="predicate">A predicate that selects types the source will register.</param>
    public SelfBindingRegistrationSource(Func<Type, bool> predicate)
    {
        if (_predicate == null) predicate = (_) => true;
        _predicate = predicate;
    }

    /// <summary>
    /// Retrieve registrations for an unregistered service, to be used
    /// by the container.
    /// </summary>
    /// <param name="service">The service that was requested.</param>
    /// <param name="registrationAccessor">A function that will return existing registrations for a service.</param>
    /// <returns>Registrations providing the service.</returns>
    public IEnumerable<IComponentRegistration> RegistrationsFor(
        Service service,
        Func<Service, IEnumerable<ServiceRegistration>> registrationAccessor)
    {
        var ts = service as TypedService;
        if (ts == null || ts.ServiceType == typeof(string))
        {
            return Enumerable.Empty<IComponentRegistration>();
        }

        var typeInfo = ts.ServiceType.GetTypeInfo();
        if (!typeInfo.IsClass ||
            typeInfo.IsSubclassOf(typeof(Delegate)) ||
            typeInfo.IsAbstract ||
            typeInfo.IsGenericTypeDefinition ||

            !_predicate(ts.ServiceType) ||
            registrationAccessor(service).Any())
        {
            return Enumerable.Empty<IComponentRegistration>();
        }

        if (typeInfo.IsGenericType)
        {
            foreach (var typeParameter in typeInfo.GenericTypeArguments)
            {
                // Issue #855: If the generic type argument doesn't match the filter don't look for a registration.
                if (_predicate(typeParameter) && !registrationAccessor(new TypedService(typeParameter)).Any())
                {
                    return Enumerable.Empty<IComponentRegistration>();
                }
            }
        }

        var builder = RegistrationBuilder.ForType(ts.ServiceType);
        RegistrationConfiguration?.Invoke(builder);

        if (ts.ServiceType.HasAttribute<SingletonAttribute>()) builder.SingleInstance();

        var registration = builder.CreateRegistration();
        return new[] { registration };
    }

    /// <summary>
    /// Returns a <see cref="string"/> that represents the current <see cref="object"/>.
    /// </summary>
    /// <returns>
    /// A <see cref="string"/> that represents the current <see cref="object"/>.
    /// </returns>
    public override string ToString()
    {
        return "SelfBindingRegistrationSource";
    }
}
