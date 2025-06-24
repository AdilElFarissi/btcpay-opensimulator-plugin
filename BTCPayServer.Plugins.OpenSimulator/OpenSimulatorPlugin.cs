using BTCPayServer.Abstractions.Contracts;
using BTCPayServer.Abstractions.Models;
using BTCPayServer.Abstractions.Services;
using BTCPayServer.Plugins.OpenSimulator.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BTCPayServer.Plugins.OpenSimulator;

public class OpenSimulatorPlugin : BaseBTCPayServerPlugin
{
    public override IBTCPayServerPlugin.PluginDependency[] Dependencies { get; } =
    {
        new() { Identifier = nameof(BTCPayServer), Condition = ">=2.1.5" }
    };

    public override void Execute(IServiceCollection services)
    {
        services.AddUIExtension("header-nav", "OpenSimulatorHeaderNav");
        services.AddHostedService<OpenSimulatorMigrationRunner>();
        services.AddSingleton<OpenSimulatorService>();
        services.AddSingleton<OpenSimulatorDbContextFactory>();
        services.AddDbContext<OpenSimulatorDbContext>((provider, o) =>
        {
            OpenSimulatorDbContextFactory factory = provider.GetRequiredService<OpenSimulatorDbContextFactory>();
            factory.ConfigureBuilder(o);
        });
    }
}
