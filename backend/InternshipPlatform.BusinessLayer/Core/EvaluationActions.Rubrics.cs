using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

// A mentor's rubric: published versions are immutable, edits happen in one draft.
public partial class EvaluationActions
{
    internal async Task<ServiceResult<MentorRubricDto>> GetRubricExecution(Guid mentorId, CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<MentorRubricDto>(MentorRequired, ServiceErrorType.Forbidden);
        }

        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<IReadOnlyList<RubricVersionSummaryDto>>> GetRubricHistoryExecution(
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<IReadOnlyList<RubricVersionSummaryDto>>(MentorRequired, ServiceErrorType.Forbidden);
        }

        var versions = await Context.EvaluationRubricVersions
            .AsNoTracking()
            .Include(item => item.Criteria)
            .Where(item => item.MentorId == mentorId)
            .OrderByDescending(item => item.VersionNumber)
            .ToListAsync(ct);
        var usage = await CountUsageAsync(versions.Select(item => item.Id), ct);

        return Ok<IReadOnlyList<RubricVersionSummaryDto>>(versions
            .Select(item => new RubricVersionSummaryDto
            {
                Id = item.Id,
                VersionNumber = item.VersionNumber,
                Title = item.Title,
                Status = item.Status,
                ChangeNote = item.ChangeNote,
                CreatedAtUtc = item.CreatedAtUtc,
                PublishedAtUtc = item.PublishedAtUtc,
                ArchivedAtUtc = item.ArchivedAtUtc,
                CriteriaCount = item.Criteria.Count,
                TotalWeight = item.Criteria.Sum(criterion => criterion.Weight),
                UsedByEvaluations = usage.GetValueOrDefault(item.Id)
            })
            .ToList());
    }

    internal async Task<ServiceResult<RubricVersionDto>> GetRubricVersionExecution(
        Guid versionId,
        Guid mentorId,
        CancellationToken ct)
    {
        var version = await Context.EvaluationRubricVersions
            .AsNoTracking()
            .Include(item => item.Criteria)
            .FirstOrDefaultAsync(item => item.Id == versionId && item.MentorId == mentorId, ct);
        if (version is null)
        {
            return Fail<RubricVersionDto>("Rubric version not found.", ServiceErrorType.NotFound);
        }

        var usage = await CountUsageAsync([version.Id], ct);
        return Ok(MapVersion(version, usage.GetValueOrDefault(version.Id)));
    }

    internal async Task<ServiceResult<MentorRubricDto>> CreateRubricDraftExecution(
        CreateRubricDraftRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (await FindMemberWithRoleAsync(mentorId, InternshipMemberRole.Mentor, ct) is null)
        {
            return Fail<MentorRubricDto>(MentorRequired, ServiceErrorType.Forbidden);
        }

        var versions = await Context.EvaluationRubricVersions
            .Include(item => item.Criteria)
            .Where(item => item.MentorId == mentorId)
            .ToListAsync(ct);
        if (versions.Any(item => item.Status == RubricVersionStatus.Draft))
        {
            return Fail<MentorRubricDto>(
                "A draft version already exists. Continue editing it or discard it first.",
                ServiceErrorType.Conflict);
        }

        var published = versions.FirstOrDefault(item => item.Status == RubricVersionStatus.Published);
        if (request.Source == RubricDraftSource.Published && published is null)
        {
            return Fail<MentorRubricDto>(
                "There is no published version to copy yet.",
                ServiceErrorType.Validation);
        }

        var now = DateTimeOffset.UtcNow;
        var draft = new EvaluationRubricVersion
        {
            Id = Guid.NewGuid(),
            MentorId = mentorId,
            VersionNumber = versions.Count == 0 ? 1 : versions.Max(item => item.VersionNumber) + 1,
            Title = published?.Title ?? "Internship rubric",
            Status = RubricVersionStatus.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        if (request.Source == RubricDraftSource.Published)
        {
            foreach (var criterion in published!.Criteria.OrderBy(item => item.Position))
            {
                draft.Criteria.Add(CopyCriterion(criterion, criterion.Position));
            }
        }
        else if (request.Source == RubricDraftSource.Template)
        {
            var position = 1;
            foreach (var template in RecommendedCriteria)
            {
                draft.Criteria.Add(new EvaluationCriterion
                {
                    Id = Guid.NewGuid(),
                    Position = position++,
                    Name = template.Name,
                    Description = template.Description,
                    Guidance = template.Guidance,
                    Weight = template.Weight,
                    ScaleMax = 5,
                    RatingStep = 0.5m,
                    IsVisibleToStudents = true
                });
            }
        }

        Context.EvaluationRubricVersions.Add(draft);
        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> UpdateRubricDraftExecution(
        UpdateRubricDraftRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        var draft = await FindDraftAsync(mentorId, ct);
        if (draft is null)
        {
            return Fail<MentorRubricDto>("There is no draft version to edit.", ServiceErrorType.NotFound);
        }

        var title = request.Title.Trim();
        if (title.Length < 3)
        {
            return Fail<MentorRubricDto>("The rubric title needs at least 3 characters.", ServiceErrorType.Validation);
        }

        draft.Title = title;
        draft.ChangeNote = TrimOrNull(request.ChangeNote);
        draft.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> DiscardRubricDraftExecution(
        Guid mentorId,
        CancellationToken ct)
    {
        var draft = await FindDraftAsync(mentorId, ct);
        if (draft is null)
        {
            return Fail<MentorRubricDto>("There is no draft version to discard.", ServiceErrorType.NotFound);
        }

        // Drafts are never attached to evaluations, so they can be deleted safely.
        Context.EvaluationRubricVersions.Remove(draft);
        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> AddCriterionExecution(
        SaveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        var error = ValidateCriterion(request);
        if (error is not null)
        {
            return Fail<MentorRubricDto>(error, ServiceErrorType.Validation);
        }

        var draft = await FindDraftAsync(mentorId, ct);
        if (draft is null)
        {
            return Fail<MentorRubricDto>(
                "Published versions are read-only. Create a draft version to change the criteria.",
                ServiceErrorType.Conflict);
        }

        if (draft.Criteria.Count >= MaximumCriteria)
        {
            return Fail<MentorRubricDto>(
                $"A rubric can have at most {MaximumCriteria} criteria.",
                ServiceErrorType.Validation);
        }

        if (HasDuplicateName(draft, request.Name, exceptId: null))
        {
            return Fail<MentorRubricDto>("Another criterion already has this name.", ServiceErrorType.Conflict);
        }

        var criterion = new EvaluationCriterion
        {
            Id = Guid.NewGuid(),
            RubricVersionId = draft.Id,
            Position = draft.Criteria.Count == 0 ? 1 : draft.Criteria.Max(item => item.Position) + 1
        };
        ApplyCriterion(criterion, request);
        draft.Criteria.Add(criterion);
        Context.EvaluationCriteria.Add(criterion);
        draft.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> UpdateCriterionExecution(
        Guid criterionId,
        SaveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        var error = ValidateCriterion(request);
        if (error is not null)
        {
            return Fail<MentorRubricDto>(error, ServiceErrorType.Validation);
        }

        var draft = await FindDraftAsync(mentorId, ct);
        var criterion = draft?.Criteria.FirstOrDefault(item => item.Id == criterionId);
        if (criterion is null)
        {
            return Fail<MentorRubricDto>(
                "Criterion not found in the draft version. Published criteria cannot be edited.",
                ServiceErrorType.NotFound);
        }

        if (HasDuplicateName(draft!, request.Name, exceptId: criterionId))
        {
            return Fail<MentorRubricDto>("Another criterion already has this name.", ServiceErrorType.Conflict);
        }

        ApplyCriterion(criterion, request);
        draft!.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> MoveCriterionExecution(
        Guid criterionId,
        MoveRubricCriterionRequest request,
        Guid mentorId,
        CancellationToken ct)
    {
        if (request.Offset is not (-1 or 1))
        {
            return Fail<MentorRubricDto>("A criterion moves one place up or down.", ServiceErrorType.Validation);
        }

        var draft = await FindDraftAsync(mentorId, ct);
        var criterion = draft?.Criteria.FirstOrDefault(item => item.Id == criterionId);
        if (criterion is null)
        {
            return Fail<MentorRubricDto>(
                "Criterion not found in the draft version. Published criteria cannot be reordered.",
                ServiceErrorType.NotFound);
        }

        var ordered = draft!.Criteria.OrderBy(item => item.Position).ToList();
        var target = ordered.IndexOf(criterion) + request.Offset;
        if (target < 0 || target >= ordered.Count)
        {
            return Ok(await BuildMentorRubricAsync(mentorId, ct));
        }

        // Positions are unique per version, so the swap goes through a free slot.
        var other = ordered[target];
        var (from, to) = (criterion.Position, other.Position);
        await using var transaction = await Context.Database.BeginTransactionAsync(ct);
        criterion.Position = 0;
        await Context.SaveChangesAsync(ct);
        other.Position = from;
        await Context.SaveChangesAsync(ct);
        criterion.Position = to;
        draft.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await Context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> RemoveCriterionExecution(
        Guid criterionId,
        Guid mentorId,
        CancellationToken ct)
    {
        var draft = await FindDraftAsync(mentorId, ct);
        var criterion = draft?.Criteria.FirstOrDefault(item => item.Id == criterionId);
        if (criterion is null)
        {
            return Fail<MentorRubricDto>(
                "Criterion not found in the draft version. Published criteria cannot be removed.",
                ServiceErrorType.NotFound);
        }

        draft!.Criteria.Remove(criterion);
        Context.EvaluationCriteria.Remove(criterion);
        await Context.SaveChangesAsync(ct);

        // Keep positions contiguous: 1, 2, 3 …
        var position = 1;
        foreach (var item in draft.Criteria.OrderBy(item => item.Position))
        {
            item.Position = position++;
        }

        draft.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    internal async Task<ServiceResult<MentorRubricDto>> PublishRubricDraftExecution(
        Guid mentorId,
        CancellationToken ct)
    {
        var draft = await FindDraftAsync(mentorId, ct);
        if (draft is null)
        {
            return Fail<MentorRubricDto>("There is no draft version to publish.", ServiceErrorType.NotFound);
        }

        var failed = BuildPublishChecks(draft).Where(check => !check.Passed).ToList();
        if (failed.Count != 0)
        {
            return Fail<MentorRubricDto>(
                "The draft cannot be published: " + string.Join("; ", failed.Select(check => check.Label)) + ".",
                ServiceErrorType.Validation);
        }

        var now = DateTimeOffset.UtcNow;
        var published = await Context.EvaluationRubricVersions
            .FirstOrDefaultAsync(item => item.MentorId == mentorId && item.Status == RubricVersionStatus.Published, ct);
        if (published is not null)
        {
            // Archive first: only one published version per mentor may exist.
            published.Status = RubricVersionStatus.Archived;
            published.ArchivedAtUtc = now;
            await Context.SaveChangesAsync(ct);
        }

        draft.Status = RubricVersionStatus.Published;
        draft.PublishedAtUtc = now;
        draft.UpdatedAtUtc = now;
        await Context.SaveChangesAsync(ct);
        return Ok(await BuildMentorRubricAsync(mentorId, ct));
    }

    // ---- Helpers ------------------------------------------------------------------
    private Task<EvaluationRubricVersion?> FindDraftAsync(Guid mentorId, CancellationToken ct) =>
        Context.EvaluationRubricVersions
            .Include(item => item.Criteria)
            .FirstOrDefaultAsync(item => item.MentorId == mentorId && item.Status == RubricVersionStatus.Draft, ct);

    private Task<EvaluationRubricVersion?> FindPublishedAsync(Guid mentorId, CancellationToken ct) =>
        Context.EvaluationRubricVersions
            .AsNoTracking()
            .Include(item => item.Criteria)
            .FirstOrDefaultAsync(item => item.MentorId == mentorId && item.Status == RubricVersionStatus.Published, ct);

    private async Task<MentorRubricDto> BuildMentorRubricAsync(Guid mentorId, CancellationToken ct)
    {
        var versions = await Context.EvaluationRubricVersions
            .AsNoTracking()
            .Include(item => item.Criteria)
            .Where(item => item.MentorId == mentorId && item.Status != RubricVersionStatus.Archived)
            .ToListAsync(ct);
        var usage = await CountUsageAsync(versions.Select(item => item.Id), ct);
        var published = versions.FirstOrDefault(item => item.Status == RubricVersionStatus.Published);
        var draft = versions.FirstOrDefault(item => item.Status == RubricVersionStatus.Draft);

        return new MentorRubricDto
        {
            Published = published is null ? null : MapVersion(published, usage.GetValueOrDefault(published.Id)),
            Draft = draft is null ? null : MapVersion(draft, 0)
        };
    }

    private async Task<Dictionary<Guid, int>> CountUsageAsync(IEnumerable<Guid> versionIds, CancellationToken ct)
    {
        var ids = versionIds.ToList();
        return await Context.Evaluations
            .AsNoTracking()
            .Where(item => ids.Contains(item.RubricVersionId))
            .GroupBy(item => item.RubricVersionId)
            .Select(group => new { group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Key, item => item.Count, ct);
    }

    private static bool HasDuplicateName(EvaluationRubricVersion version, string name, Guid? exceptId) =>
        version.Criteria.Any(item =>
            item.Id != exceptId &&
            string.Equals(item.Name.Trim(), name.Trim(), StringComparison.OrdinalIgnoreCase));

    private static void ApplyCriterion(EvaluationCriterion criterion, SaveRubricCriterionRequest request)
    {
        criterion.Name = request.Name.Trim();
        criterion.Description = request.Description.Trim();
        criterion.Guidance = request.Guidance.Trim();
        criterion.Weight = request.Weight;
        criterion.ScaleMax = request.ScaleMax;
        criterion.RatingStep = request.RatingStep;
        criterion.IsVisibleToStudents = request.IsVisibleToStudents;
    }

    private static EvaluationCriterion CopyCriterion(EvaluationCriterion source, int position) =>
        new()
        {
            Id = Guid.NewGuid(),
            Position = position,
            Name = source.Name,
            Description = source.Description,
            Guidance = source.Guidance,
            Weight = source.Weight,
            ScaleMax = source.ScaleMax,
            RatingStep = source.RatingStep,
            IsVisibleToStudents = source.IsVisibleToStudents
        };
}
