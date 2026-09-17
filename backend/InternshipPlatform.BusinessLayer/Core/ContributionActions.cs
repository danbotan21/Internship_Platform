using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    protected readonly AppDbContext Context;
    protected readonly IContributionFileStorageAction FileStorage;

    public ContributionActions(
        AppDbContext context,
        IContributionFileStorageAction fileStorage)
    {
        Context = context;
        FileStorage = fileStorage;
    }
}
