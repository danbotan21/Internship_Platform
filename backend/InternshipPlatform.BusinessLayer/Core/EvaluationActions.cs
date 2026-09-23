using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.DataAccess.Context;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class EvaluationActions
{
    protected readonly AppDbContext Context;
    protected readonly IInternshipDirectoryAction Directory;

    public EvaluationActions(AppDbContext context, IInternshipDirectoryAction directory)
    {
        Context = context;
        Directory = directory;
    }
}
