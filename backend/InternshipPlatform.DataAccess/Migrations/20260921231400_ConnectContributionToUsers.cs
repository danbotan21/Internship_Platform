using Microsoft.EntityFrameworkCore.Migrations;
using InternshipPlatform.DataAccess.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace InternshipPlatform.DataAccess.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260921231400_ConnectContributionToUsers")]
public partial class ConnectContributionToUsers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "GitHubUsername",
            table: "Users",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "MentorId",
            table: "Users",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Users_MentorId",
            table: "Users",
            column: "MentorId");

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Users_MentorId",
            table: "Users",
            column: "MentorId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_Contributions_Users_StudentId",
            table: "Contributions",
            column: "StudentId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_ContributionReviews_Users_MentorId",
            table: "ContributionReviews",
            column: "MentorId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_ContributionCollaborators_Users_UserId",
            table: "ContributionCollaborators",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Users_Users_MentorId",
            table: "Users");

        migrationBuilder.DropForeignKey(
            name: "FK_Contributions_Users_StudentId",
            table: "Contributions");

        migrationBuilder.DropForeignKey(
            name: "FK_ContributionReviews_Users_MentorId",
            table: "ContributionReviews");

        migrationBuilder.DropForeignKey(
            name: "FK_ContributionCollaborators_Users_UserId",
            table: "ContributionCollaborators");

        migrationBuilder.DropIndex(
            name: "IX_Users_MentorId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "GitHubUsername",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "MentorId",
            table: "Users");
    }
}
