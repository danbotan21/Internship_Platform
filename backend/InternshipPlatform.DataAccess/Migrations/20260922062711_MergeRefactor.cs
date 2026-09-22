using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class MergeRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_StudentId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Milestones_Users_ReviewedByUserId",
                table: "Milestones");

            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_Users_MentorId",
                table: "Opportunities");

            migrationBuilder.DropForeignKey(
                name: "FK_SupervisorFeedback_Users_SupervisorUserId",
                table: "SupervisorFeedback");

            migrationBuilder.DropTable(
                name: "UserSavedOpportunities");

            migrationBuilder.DropIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens");

            migrationBuilder.DropIndex(
                name: "IX_Applications_StudentId_OpportunityId",
                table: "Applications");

            // Explicitly cast or reset columns that PostgreSQL cannot auto-cast from text/jsonb to integer/text[]
            migrationBuilder.Sql(@"
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""Type"" TYPE integer USING 0;
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""Technologies"" TYPE text[] USING '{}';
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""Tags"" TYPE text[] USING '{}';
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""Status"" TYPE integer USING 0;
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""Responsibilities"" TYPE text[] USING '{}';
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""Requirements"" TYPE text[] USING '{}';
                ALTER TABLE ""Opportunities"" ALTER COLUMN ""LocationType"" TYPE integer USING 0;
                ALTER TABLE ""Milestones"" ALTER COLUMN ""Status"" TYPE integer USING 0;
                ALTER TABLE ""Applications"" ALTER COLUMN ""Status"" TYPE integer USING 0;
                ALTER TABLE ""Applications"" ALTER COLUMN ""AdditionalFilePaths"" TYPE text[] USING '{}';
            ");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Opportunities",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<string>>(
                name: "Technologies",
                table: "Opportunities",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<List<string>>(
                name: "Tags",
                table: "Opportunities",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Opportunities",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<string>>(
                name: "Responsibilities",
                table: "Opportunities",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<List<string>>(
                name: "Requirements",
                table: "Opportunities",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<int>(
                name: "LocationType",
                table: "Opportunities",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Opportunities",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Milestones",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Applications",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<string>>(
                name: "AdditionalFilePaths",
                table: "Applications",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.Sql("DROP TABLE IF EXISTS \"DocumentAudits\" CASCADE; DROP TABLE IF EXISTS \"Documents\" CASCADE;");

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    FileName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Category = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    FileUrl = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    FileType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SigningStatus = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    TotalSignatures = table.Column<int>(type: "integer", nullable: false),
                    CompletedSignatures = table.Column<int>(type: "integer", nullable: false),
                    VisibilityRole = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UploadedBy = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentAudits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PerformedBy = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Details = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentAudits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentAudits_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Documents",
                columns: new[] { "Id", "ApprovedAt", "ApprovedBy", "Category", "CompletedSignatures", "CreatedAt", "ExpiresAt", "FileName", "FileType", "FileUrl", "IsMandatory", "RejectionReason", "SigningStatus", "Size", "Status", "Title", "TotalSignatures", "UpdatedAt", "UploadedBy", "Version", "VisibilityRole" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 10, 24, 14, 0, 0, 0, DateTimeKind.Utc), "Dr. Michael Chen (Mentor)", "Report", 3, new DateTime(2025, 10, 24, 10, 30, 0, 0, DateTimeKind.Utc), null, "Spring_Milestone_2_Report.pdf", "pdf", "/uploads/Spring_Milestone_2_Report.pdf", true, null, "Complete", 1468006L, "Approved", "Spring Milestone 2 Report", 3, new DateTime(2025, 10, 24, 14, 0, 0, 0, DateTimeKind.Utc), "Ana Popescu", 3, "Public" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), null, null, "Agreement", 2, new DateTime(2025, 10, 19, 11, 15, 0, 0, DateTimeKind.Utc), null, "Institutional_Sign_Off_Agreement.docx", "docx", "/uploads/Institutional_Sign_Off_Agreement.docx", true, null, "SignedByMentor", 430080L, "Pending", "Institutional Sign Off Agreement", 3, new DateTime(2025, 10, 19, 11, 15, 0, 0, DateTimeKind.Utc), "Ana Popescu", 1, "Public" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2025, 10, 14, 16, 20, 0, 0, DateTimeKind.Utc), "Elena Vasilescu (Coordinator)", "Report", 3, new DateTime(2025, 10, 14, 9, 45, 0, 0, DateTimeKind.Utc), null, "Completed_Practicum_Evaluation.xlsx", "xlsx", "/uploads/Completed_Practicum_Evaluation.xlsx", false, null, "Complete", 2202009L, "Approved", "Completed Practicum Evaluation", 3, new DateTime(2025, 10, 14, 16, 20, 0, 0, DateTimeKind.Utc), "Ana Popescu", 2, "MentorOnly" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), null, null, "Agreement", 2, new DateTime(2025, 10, 3, 8, 30, 0, 0, DateTimeKind.Utc), new DateTime(2025, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Health_Safety_Compliance_Form.pdf", "pdf", "/uploads/Health_Safety_Compliance_Form.pdf", true, null, "SignedByStudent", 317440L, "Pending", "Health & Safety Compliance Form", 3, new DateTime(2025, 10, 3, 8, 30, 0, 0, DateTimeKind.Utc), "Ana Popescu", 1, "Public" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_UserId",
                table: "Opportunities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_StudentId",
                table: "Applications",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAudits_DocumentId",
                table: "DocumentAudits",
                column: "DocumentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_StudentId",
                table: "Applications",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Milestones_Users_ReviewedByUserId",
                table: "Milestones",
                column: "ReviewedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_Users_MentorId",
                table: "Opportunities",
                column: "MentorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_Users_UserId",
                table: "Opportunities",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SupervisorFeedback_Users_SupervisorUserId",
                table: "SupervisorFeedback",
                column: "SupervisorUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Users_StudentId",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Milestones_Users_ReviewedByUserId",
                table: "Milestones");

            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_Users_MentorId",
                table: "Opportunities");

            migrationBuilder.DropForeignKey(
                name: "FK_Opportunities_Users_UserId",
                table: "Opportunities");

            migrationBuilder.DropForeignKey(
                name: "FK_SupervisorFeedback_Users_SupervisorUserId",
                table: "SupervisorFeedback");

            migrationBuilder.DropTable(
                name: "DocumentAudits");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_UserId",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Applications_StudentId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Opportunities");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Opportunities",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Technologies",
                table: "Opportunities",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AlterColumn<string>(
                name: "Tags",
                table: "Opportunities",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Opportunities",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Responsibilities",
                table: "Opportunities",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AlterColumn<string>(
                name: "Requirements",
                table: "Opportunities",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AlterColumn<string>(
                name: "LocationType",
                table: "Opportunities",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Milestones",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Applications",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "AdditionalFilePaths",
                table: "Applications",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.CreateTable(
                name: "UserSavedOpportunities",
                columns: table => new
                {
                    SavedOpportunitiesId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSavedOpportunities", x => new { x.SavedOpportunitiesId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UserSavedOpportunities_Opportunities_SavedOpportunitiesId",
                        column: x => x.SavedOpportunitiesId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSavedOpportunities_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_StudentId_OpportunityId",
                table: "Applications",
                columns: new[] { "StudentId", "OpportunityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSavedOpportunities_UserId",
                table: "UserSavedOpportunities",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Users_StudentId",
                table: "Applications",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Milestones_Users_ReviewedByUserId",
                table: "Milestones",
                column: "ReviewedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Opportunities_Users_MentorId",
                table: "Opportunities",
                column: "MentorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupervisorFeedback_Users_SupervisorUserId",
                table: "SupervisorFeedback",
                column: "SupervisorUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
