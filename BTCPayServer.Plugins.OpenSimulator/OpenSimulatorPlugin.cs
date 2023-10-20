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
        new() { Identifier = nameof(BTCPayServer), Condition = ">=1.11.7" }
    };

    public override void Execute(IServiceCollection services)
    {
        services.AddSingleton<IUIExtension>(new UIExtension("OpenSimulatorHeaderNav", "header-nav"));
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
