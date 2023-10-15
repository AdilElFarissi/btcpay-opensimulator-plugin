using BTCPayServer.Abstractions.Contracts;
using BTCPayServer.Abstractions.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;

namespace BTCPayServer.Plugins.OpenSimulator;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<OpenSimulatorDbContext>
{
    public OpenSimulatorDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<OpenSimulatorDbContext> builder = new DbContextOptionsBuilder<OpenSimulatorDbContext>();

        builder.UseSqlite("Data Source=opensim.db");

        return new OpenSimulatorDbContext(builder.Options, true);
    }
}

public class OpenSimulatorDbContextFactory : BaseDbContextFactory<OpenSimulatorDbContext>
{
    public OpenSimulatorDbContextFactory(IOptions<DatabaseOptions> options) : base(options, "BTCPayServer.Plugins.OpenSimulator")
    {
    }

    public override OpenSimulatorDbContext CreateContext()
    {
        DbContextOptionsBuilder<OpenSimulatorDbContext> builder = new DbContextOptionsBuilder<OpenSimulatorDbContext>();
        ConfigureBuilder(builder);
        return new OpenSimulatorDbContext(builder.Options);
    }
}
