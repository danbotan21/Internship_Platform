using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RedesignContributionManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionEvidence_Content",
                table: "ContributionEvidence");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionEvidence_Type",
                table: "ContributionEvidence");

            // Former "file" evidence (type 2) becomes Image (3) or Document (2).
            migrationBuilder.Sql(
                "UPDATE \"ContributionEvidence\" SET \"Type\" = 3 " +
                "WHERE \"Type\" = 2 AND \"ContentType\" LIKE 'image/%';");

            migrationBuilder.DropIndex(
                name: "IX_ContributionCollaborators_ContributionId_NormalizedEmail",
                table: "ContributionCollaborators");

            migrationBuilder.DropIndex(
                name: "IX_ContributionCollaborators_ContributionId_Status",
                table: "ContributionCollaborators");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionCollaborators_Status",
                table: "ContributionCollaborators");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                table: "ContributionCollaborators");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "ContributionCollaborators");

            migrationBuilder.RenameColumn(
                name: "Feedback",
                table: "ContributionReviews",
                newName: "Summary");

            migrationBuilder.RenameColumn(
                name: "ChangesRequestedAtUtc",
                table: "ContributionReviews",
                newName: "ReviewedAtUtc");

            migrationBuilder.AddColumn<int>(
                name: "LinkedIssueNumber",
                table: "ContributionRevisions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedIssueRepository",
                table: "ContributionRevisions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedIssueState",
                table: "ContributionRevisions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedIssueTitle",
                table: "ContributionRevisions",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "WorkEndDate",
                table: "ContributionRevisions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "WorkStartDate",
                table: "ContributionRevisions",
                type: "date",
                nullable: true);

            // The free-text work period cannot be parsed reliably; existing
            // revisions start from the day they were created.
            migrationBuilder.Sql(
                "UPDATE \"ContributionRevisions\" SET " +
                "\"WorkStartDate\" = (\"CreatedAtUtc\" AT TIME ZONE 'UTC')::date, " +
                "\"WorkEndDate\" = (\"CreatedAtUtc\" AT TIME ZONE 'UTC')::date;");

            migrationBuilder.DropColumn(
                name: "EvidenceNote",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "LinkedTaskReference",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "WorkPeriod",
                table: "ContributionRevisions");

            migrationBuilder.AddColumn<int>(
                name: "Outcome",
                table: "ContributionReviews",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RejectionReason",
                table: "ContributionReviews",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("UPDATE \"ContributionReviews\" SET \"Outcome\" = 1;");

            // Validated (1) -> outcome 2, Rejected (2) -> outcome 3.
            migrationBuilder.Sql(
                "INSERT INTO \"ContributionReviews\" " +
                "(\"Id\", \"ContributionRevisionId\", \"MentorId\", \"Summary\", \"ReviewedAtUtc\", \"Outcome\", \"RejectionReason\") " +
                "SELECT \"Id\", \"ContributionRevisionId\", \"MentorId\", " +
                "COALESCE(\"Note\", \"Reason\", ''), \"DecidedAtUtc\", \"Decision\" + 1, " +
                "CASE WHEN \"Decision\" = 2 THEN CASE \"Reason\" " +
                "WHEN 'Evidence cannot be verified' THEN 1 " +
                "WHEN 'Work is outside the internship scope' THEN 2 " +
                "WHEN 'Contribution is duplicated' THEN 3 " +
                "WHEN 'Attribution cannot be verified' THEN 4 " +
                "ELSE 5 END END " +
                "FROM \"ContributionDecisions\";");

            migrationBuilder.DropTable(
                name: "ContributionDecisions");

            migrationBuilder.AddColumn<string>(
                name: "Caption",
                table: "ContributionEvidence",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GitHubAdditions",
                table: "ContributionEvidence",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubAuthorLogin",
                table: "ContributionEvidence",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "GitHubAuthoredAtUtc",
                table: "ContributionEvidence",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GitHubChangedFiles",
                table: "ContributionEvidence",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubChecksConclusion",
                table: "ContributionEvidence",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GitHubDeletions",
                table: "ContributionEvidence",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubDetailsJson",
                table: "ContributionEvidence",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubReference",
                table: "ContributionEvidence",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubRepository",
                table: "ContributionEvidence",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubState",
                table: "ContributionEvidence",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ResolutionNote",
                table: "ContributionCollaborators",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DisputeReason",
                table: "ContributionCollaborators",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Area",
                table: "ContributionCollaborators",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RoleDescription",
                table: "ContributionCollaborators",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "ContributionCollaborators",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // Collaborators used to be free-text names that cannot be mapped to
            // internship members, so they are removed and must be re-added.
            migrationBuilder.Sql("DELETE FROM \"ContributionCollaborators\";");

            migrationBuilder.CreateTable(
                name: "ContributionFeedbackItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionReviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    EvidenceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Response = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RespondedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionFeedbackItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContributionFeedbackItems_ContributionReviews_ContributionR~",
                        column: x => x.ContributionReviewId,
                        principalTable: "ContributionReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContributionReviewChecks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionReviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    Criterion = table.Column<int>(type: "integer", nullable: false),
                    IsMet = table.Column<bool>(type: "boolean", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionReviewChecks", x => x.Id);
                    table.CheckConstraint("CK_ContributionReviewChecks_Criterion", "\"Criterion\" IN (1, 2, 3, 4, 5)");
                    table.ForeignKey(
                        name: "FK_ContributionReviewChecks_ContributionReviews_ContributionRe~",
                        column: x => x.ContributionReviewId,
                        principalTable: "ContributionReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionRevisions_WorkPeriod",
                table: "ContributionRevisions",
                sql: "\"WorkStartDate\" IS NULL OR \"WorkEndDate\" IS NULL OR \"WorkEndDate\" >= \"WorkStartDate\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionReviews_Outcome",
                table: "ContributionReviews",
                sql: "\"Outcome\" IN (1, 2, 3)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionReviews_RejectionReason",
                table: "ContributionReviews",
                sql: "(\"Outcome\" = 3 AND \"RejectionReason\" IS NOT NULL) OR (\"Outcome\" <> 3 AND \"RejectionReason\" IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionEvidence_Content",
                table: "ContributionEvidence",
                sql: "(\"Type\" = 1 AND \"ExternalUrl\" IS NOT NULL AND \"StoragePath\" IS NULL) OR (\"Type\" IN (2, 3) AND \"StoragePath\" IS NOT NULL AND \"ExternalUrl\" IS NULL) OR (\"Type\" IN (4, 5) AND \"GitHubRepository\" IS NOT NULL AND \"GitHubReference\" IS NOT NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionEvidence_Type",
                table: "ContributionEvidence",
                sql: "\"Type\" IN (1, 2, 3, 4, 5)");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionCollaborators_ContributionId_UserId",
                table: "ContributionCollaborators",
                columns: new[] { "ContributionId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContributionCollaborators_UserId_Status",
                table: "ContributionCollaborators",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionCollaborators_Area",
                table: "ContributionCollaborators",
                sql: "\"Area\" IN (1, 2, 3, 4, 5, 6)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionCollaborators_Status",
                table: "ContributionCollaborators",
                sql: "\"Status\" IN (1, 2, 3)");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionFeedbackItems_ContributionReviewId_Position",
                table: "ContributionFeedbackItems",
                columns: new[] { "ContributionReviewId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContributionReviewChecks_ContributionReviewId_Criterion",
                table: "ContributionReviewChecks",
                columns: new[] { "ContributionReviewId", "Criterion" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContributionFeedbackItems");

            migrationBuilder.DropTable(
                name: "ContributionReviewChecks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionRevisions_WorkPeriod",
                table: "ContributionRevisions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionReviews_Outcome",
                table: "ContributionReviews");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionReviews_RejectionReason",
                table: "ContributionReviews");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionEvidence_Content",
                table: "ContributionEvidence");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionEvidence_Type",
                table: "ContributionEvidence");

            migrationBuilder.DropIndex(
                name: "IX_ContributionCollaborators_ContributionId_UserId",
                table: "ContributionCollaborators");

            migrationBuilder.DropIndex(
                name: "IX_ContributionCollaborators_UserId_Status",
                table: "ContributionCollaborators");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionCollaborators_Area",
                table: "ContributionCollaborators");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ContributionCollaborators_Status",
                table: "ContributionCollaborators");

            migrationBuilder.DropColumn(
                name: "LinkedIssueNumber",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "LinkedIssueRepository",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "LinkedIssueState",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "LinkedIssueTitle",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "WorkEndDate",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "WorkStartDate",
                table: "ContributionRevisions");

            migrationBuilder.DropColumn(
                name: "Outcome",
                table: "ContributionReviews");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "ContributionReviews");

            migrationBuilder.DropColumn(
                name: "Caption",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubAdditions",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubAuthorLogin",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubAuthoredAtUtc",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubChangedFiles",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubChecksConclusion",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubDeletions",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubDetailsJson",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubReference",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubRepository",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "GitHubState",
                table: "ContributionEvidence");

            migrationBuilder.DropColumn(
                name: "Area",
                table: "ContributionCollaborators");

            migrationBuilder.DropColumn(
                name: "RoleDescription",
                table: "ContributionCollaborators");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ContributionCollaborators");

            migrationBuilder.RenameColumn(
                name: "Summary",
                table: "ContributionReviews",
                newName: "Feedback");

            migrationBuilder.RenameColumn(
                name: "ReviewedAtUtc",
                table: "ContributionReviews",
                newName: "ChangesRequestedAtUtc");

            migrationBuilder.AddColumn<string>(
                name: "EvidenceNote",
                table: "ContributionRevisions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedTaskReference",
                table: "ContributionRevisions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkPeriod",
                table: "ContributionRevisions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "ResolutionNote",
                table: "ContributionCollaborators",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DisputeReason",
                table: "ContributionCollaborators",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                table: "ContributionCollaborators",
                type: "character varying(320)",
                maxLength: 320,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "ContributionCollaborators",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ContributionDecisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionRevisionId = table.Column<Guid>(type: "uuid", nullable: false),
                    DecidedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Decision = table.Column<int>(type: "integer", nullable: false),
                    MentorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
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
                name: "CK_ContributionEvidence_Content",
                table: "ContributionEvidence",
                sql: "(\"Type\" = 1 AND \"ExternalUrl\" IS NOT NULL AND \"StoragePath\" IS NULL) OR (\"Type\" = 2 AND \"StoragePath\" IS NOT NULL AND \"ExternalUrl\" IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionEvidence_Type",
                table: "ContributionEvidence",
                sql: "\"Type\" IN (1, 2)");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionCollaborators_ContributionId_NormalizedEmail",
                table: "ContributionCollaborators",
                columns: new[] { "ContributionId", "NormalizedEmail" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContributionCollaborators_ContributionId_Status",
                table: "ContributionCollaborators",
                columns: new[] { "ContributionId", "Status" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_ContributionCollaborators_Status",
                table: "ContributionCollaborators",
                sql: "\"Status\" IN (1, 2, 3, 4)");

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
    }
}
