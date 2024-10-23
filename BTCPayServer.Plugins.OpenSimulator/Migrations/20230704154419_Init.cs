using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BTCPayServer.Plugins.OpenSimulator.Migrations
{
    [DbContext(typeof(OpenSimulatorDbContext))]
    [Migration("20230704154419_Init")]
    public partial class Init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "BTCPayServer.Plugins.OpenSimulator");

            migrationBuilder.CreateTable(
                name: "Authorizations",
                schema: "BTCPayServer.Plugins.OpenSimulator",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    StoreId = table.Column<string>(nullable: false),
                    AvatarName = table.Column<string>(nullable: false),
                    AvatarId = table.Column<string>(nullable: false),
                    AvatarHomeURL = table.Column<string>(nullable: false),
                    ObjectName = table.Column<string>(nullable: false),
                    ObjectId = table.Column<string>(nullable: false),
                    ObjectRegion = table.Column<string>(nullable: false),
                    ObjectLocation = table.Column<string>(nullable: false),
                    ObjectURL = table.Column<string>(nullable: false),
                    ObjectAuthorization = table.Column<bool>(nullable: false),
                    Timestamp = table.Column<DateTimeOffset>(nullable: false),
                    Secret = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Authorizations", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Authorizations",
                schema: "BTCPayServer.Plugins.OpenSimulator");
        }
    }
}
