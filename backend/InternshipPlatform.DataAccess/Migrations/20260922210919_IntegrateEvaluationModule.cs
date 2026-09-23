using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipPlatform.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class IntegrateEvaluationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EvaluationRubricVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MentorId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ChangeNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PublishedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ArchivedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationRubricVersions", x => x.Id);
                    table.CheckConstraint("CK_EvaluationRubricVersions_Status", "\"Status\" IN (1, 2, 3)");
                    table.CheckConstraint("CK_EvaluationRubricVersions_VersionNumber", "\"VersionNumber\" >= 1");
                    table.ForeignKey(
                        name: "FK_EvaluationRubricVersions_Users_MentorId",
                        column: x => x.MentorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationCriteria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RubricVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Guidance = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Weight = table.Column<int>(type: "integer", nullable: false),
                    ScaleMax = table.Column<int>(type: "integer", nullable: false),
                    RatingStep = table.Column<decimal>(type: "numeric(3,1)", precision: 3, scale: 1, nullable: false),
                    IsVisibleToStudents = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationCriteria", x => x.Id);
                    table.CheckConstraint("CK_EvaluationCriteria_Scale", "\"ScaleMax\" IN (5, 10) AND \"RatingStep\" IN (0.5, 1)");
                    table.CheckConstraint("CK_EvaluationCriteria_Weight", "\"Weight\" BETWEEN 1 AND 100");
                    table.ForeignKey(
                        name: "FK_EvaluationCriteria_EvaluationRubricVersions_RubricVersionId",
                        column: x => x.RubricVersionId,
                        principalTable: "EvaluationRubricVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Evaluations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    MentorId = table.Column<Guid>(type: "uuid", nullable: false),
                    RubricVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Strengths = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AreasForImprovement = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    NextSteps = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OverallComment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    FinalScore = table.Column<decimal>(type: "numeric(5,1)", precision: 5, scale: 1, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ReadyForReviewAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FinalizedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    AcknowledgedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    StudentResponse = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluations", x => x.Id);
                    table.CheckConstraint("CK_Evaluations_FinalScore", "(\"Status\" = 3 AND \"FinalScore\" IS NOT NULL) OR (\"Status\" <> 3)");
                    table.CheckConstraint("CK_Evaluations_Period", "\"PeriodEnd\" >= \"PeriodStart\"");
                    table.CheckConstraint("CK_Evaluations_Status", "\"Status\" IN (1, 2, 3)");
                    table.CheckConstraint("CK_Evaluations_Type", "\"Type\" IN (1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_Evaluations_EvaluationRubricVersions_RubricVersionId",
                        column: x => x.RubricVersionId,
                        principalTable: "EvaluationRubricVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Evaluations_Users_MentorId",
                        column: x => x.MentorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Evaluations_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EvaluationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CriterionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric(4,1)", precision: 4, scale: 1, nullable: true),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvaluationScores_EvaluationCriteria_CriterionId",
                        column: x => x.CriterionId,
                        principalTable: "EvaluationCriteria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EvaluationScores_Evaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalTable: "Evaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationCriteria_RubricVersionId_Position",
                table: "EvaluationCriteria",
                columns: new[] { "RubricVersionId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationRubricVersions_MentorId_VersionNumber",
                table: "EvaluationRubricVersions",
                columns: new[] { "MentorId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationRubricVersions_OnePublishedPerMentor",
                table: "EvaluationRubricVersions",
                column: "MentorId",
                unique: true,
                filter: "\"Status\" = 2");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_MentorId_Status",
                table: "Evaluations",
                columns: new[] { "MentorId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_RubricVersionId",
                table: "Evaluations",
                column: "RubricVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_StudentId_Type",
                table: "Evaluations",
                columns: new[] { "StudentId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScores_CriterionId",
                table: "EvaluationScores",
                column: "CriterionId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScores_EvaluationId_CriterionId",
                table: "EvaluationScores",
                columns: new[] { "EvaluationId", "CriterionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EvaluationScores");

            migrationBuilder.DropTable(
                name: "EvaluationCriteria");

            migrationBuilder.DropTable(
                name: "Evaluations");

            migrationBuilder.DropTable(
                name: "EvaluationRubricVersions");
        }
    }
}
