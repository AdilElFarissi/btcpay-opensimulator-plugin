using System.Threading;
using System.Threading.Tasks;
using BTCPayServer.Abstractions.Contracts;
using BTCPayServer.Plugins.OpenSimulator.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace BTCPayServer.Plugins.OpenSimulator;

public class OpenSimulatorMigrationRunner : IHostedService
{
    private readonly OpenSimulatorDbContextFactory _OpenSimulatorDbContextFactory;
    private readonly OpenSimulatorService _OpenSimulatorService;
    private readonly ISettingsRepository _settingsRepository;

    public OpenSimulatorMigrationRunner(
        ISettingsRepository settingsRepository,
        OpenSimulatorDbContextFactory OpenSimulatorDbContextFactory,
        OpenSimulatorService OpenSimulatorService)
    {
        _settingsRepository = settingsRepository;
        _OpenSimulatorDbContextFactory = OpenSimulatorDbContextFactory;
        _OpenSimulatorService = OpenSimulatorService;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        OpenSimulatorDataMigrationHistory settings = await _settingsRepository.GetSettingAsync<OpenSimulatorDataMigrationHistory>() ??
                                              new OpenSimulatorDataMigrationHistory();
        await using var ctx = _OpenSimulatorDbContextFactory.CreateContext();
        await ctx.Database.MigrateAsync(cancellationToken);

        // settings migrations
        if (!settings.Updated)
        {
            settings.Updated = true;
            await _settingsRepository.UpdateSetting(settings);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public class OpenSimulatorDataMigrationHistory
    {
        public bool Updated { get; set; }
    }
}

