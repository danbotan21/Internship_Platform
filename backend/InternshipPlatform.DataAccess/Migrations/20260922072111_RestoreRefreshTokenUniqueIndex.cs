using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <summary>
    /// MergeRefactor dropped the unique index on RefreshTokens.Token; the auth
    /// flow relies on it to look a token up, so it is put back here.
    /// The messaging schema this merge also brings in is created by AddMessaging.
    /// </summary>
    public partial class RestoreRefreshTokenUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens");
        }
    }
}
