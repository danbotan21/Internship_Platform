using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContributionDecisions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Contributions_Status",
                table: "Contributions");

            migrationBuilder.CreateTable(
                name: "ContributionDecisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionRevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MentorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Decision = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DecidedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionDecisions", x => x.Id);
                    table.CheckConstraint("CK_ContributionDecisions_Decision", "\"Decision\" IN (1, 2)");
                    table.ForeignKey(
                        name: "FK_ContributionDecisions_ContributionRevisions_ContributionRev~",
                        column: x => x.ContributionRevisionId,
                        principalTable: "ContributionRevisions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Contributions_Status",
                table: "Contributions",
                sql: "\"Status\" IN (1, 2, 3, 4, 5)");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionDecisions_ContributionRevisionId",
                table: "ContributionDecisions",
                column: "ContributionRevisionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContributionDecisions_MentorId",
                table: "ContributionDecisions",
                column: "MentorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContributionDecisions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Contributions_Status",
                table: "Contributions");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Contributions_Status",
                table: "Contributions",
                sql: "\"Status\" IN (1, 2, 3)");
        }
    }
}
