using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class InitialDocumentationVault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "IX_DocumentAudits_DocumentId",
                table: "DocumentAudits",
                column: "DocumentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentAudits");

            migrationBuilder.DropTable(
                name: "Documents");
        }
    }
}
