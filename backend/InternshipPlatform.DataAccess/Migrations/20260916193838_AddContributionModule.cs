using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddContributionModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contributions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CurrentRevisionNumber = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SubmittedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contributions", x => x.Id);
                    table.CheckConstraint("CK_Contributions_CurrentRevisionNumber", "\"CurrentRevisionNumber\" >= 1");
                    table.CheckConstraint("CK_Contributions_Status", "\"Status\" IN (1, 2, 3)");
                });

            migrationBuilder.CreateTable(
                name: "ContributionRevisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionId = table.Column<Guid>(type: "uuid", nullable: false),
                    RevisionNumber = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    WorkPeriod = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    OwnRole = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LinkedTaskReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EvidenceNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RevisionNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SubmittedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionRevisions", x => x.Id);
                    table.CheckConstraint("CK_ContributionRevisions_Category", "\"Category\" IN (1, 2, 3, 4, 5, 6)");
                    table.CheckConstraint("CK_ContributionRevisions_RevisionNumber", "\"RevisionNumber\" >= 1");
                    table.ForeignKey(
                        name: "FK_ContributionRevisions_Contributions_ContributionId",
                        column: x => x.ContributionId,
                        principalTable: "Contributions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContributionEvidence",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionRevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ExternalUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    StoragePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionEvidence", x => x.Id);
                    table.CheckConstraint("CK_ContributionEvidence_Content", "(\"Type\" = 1 AND \"ExternalUrl\" IS NOT NULL AND \"StoragePath\" IS NULL) OR (\"Type\" = 2 AND \"StoragePath\" IS NOT NULL AND \"ExternalUrl\" IS NULL)");
                    table.CheckConstraint("CK_ContributionEvidence_Type", "\"Type\" IN (1, 2)");
                    table.ForeignKey(
                        name: "FK_ContributionEvidence_ContributionRevisions_ContributionRevi~",
                        column: x => x.ContributionRevisionId,
                        principalTable: "ContributionRevisions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContributionReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionRevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MentorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Feedback = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ChangesRequestedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContributionReviews_ContributionRevisions_ContributionRevis~",
                        column: x => x.ContributionRevisionId,
                        principalTable: "ContributionRevisions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContributionEvidence_ContributionRevisionId",
                table: "ContributionEvidence",
                column: "ContributionRevisionId");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionReviews_ContributionRevisionId",
                table: "ContributionReviews",
                column: "ContributionRevisionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContributionReviews_MentorId",
                table: "ContributionReviews",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionRevisions_ContributionId_RevisionNumber",
                table: "ContributionRevisions",
                columns: new[] { "ContributionId", "RevisionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contributions_Status_UpdatedAtUtc",
                table: "Contributions",
                columns: new[] { "Status", "UpdatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Contributions_StudentId_Status",
                table: "Contributions",
                columns: new[] { "StudentId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContributionEvidence");

            migrationBuilder.DropTable(
                name: "ContributionReviews");

            migrationBuilder.DropTable(
                name: "ContributionRevisions");

            migrationBuilder.DropTable(
                name: "Contributions");
        }
    }
}
