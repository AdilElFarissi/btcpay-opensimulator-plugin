using BTCPayServer.Abstractions.Contracts;
using BTCPayServer.Abstractions.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;
using System;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;

namespace BTCPayServer.Plugins.OpenSimulator;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<OpenSimulatorDbContext>
{
    public OpenSimulatorDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<OpenSimulatorDbContext> builder = new DbContextOptionsBuilder<OpenSimulatorDbContext>();

        builder.UseNpgsql("User ID=postgres;Host=127.0.0.1;Port=39372;Database=opensim");

        return new OpenSimulatorDbContext(builder.Options, true);
    }
}

public class OpenSimulatorDbContextFactory : BaseDbContextFactory<OpenSimulatorDbContext>
{
    public OpenSimulatorDbContextFactory(IOptions<DatabaseOptions> options) : base(options, "BTCPayServer.Plugins.OpenSimulator")
    {
    }

    public override OpenSimulatorDbContext CreateContext(Action<NpgsqlDbContextOptionsBuilder> npgsqlOptionsAction = null)
    {
        DbContextOptionsBuilder<OpenSimulatorDbContext> builder = new DbContextOptionsBuilder<OpenSimulatorDbContext>();
        ConfigureBuilder(builder);
        return new OpenSimulatorDbContext(builder.Options);
    }
}
