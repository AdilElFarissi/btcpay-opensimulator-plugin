using BTCPayServer.Plugins.OpenSimulator.Data;
using Microsoft.EntityFrameworkCore;


namespace BTCPayServer.Plugins.OpenSimulator;

public class OpenSimulatorDbContext : DbContext
{
    private readonly bool _designTime;

    public OpenSimulatorDbContext(DbContextOptions<OpenSimulatorDbContext> options, bool designTime = false)
        : base(options)
    {
        _designTime = designTime;
    }

    public DbSet<OpenSimulatorData> Authorizations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("BTCPayServer.Plugins.OpenSimulator");
        
    }
}
