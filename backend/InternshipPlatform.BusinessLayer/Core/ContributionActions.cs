using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    protected readonly AppDbContext Context;
    protected readonly IContributionFileStorageAction FileStorage;
    protected readonly IInternshipDirectoryAction Directory;
    protected readonly IGitHubAction GitHub;

    public ContributionActions(
        AppDbContext context,
        IContributionFileStorageAction fileStorage,
        IInternshipDirectoryAction directory,
        IGitHubAction gitHub)
    {
        Context = context;
        FileStorage = fileStorage;
        Directory = directory;
        GitHub = gitHub;
    }
}
