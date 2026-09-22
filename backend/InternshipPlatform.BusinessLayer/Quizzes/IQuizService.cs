namespace InternshipPlatform.BusinessLayer.Quizzes;

public interface IQuizService
{
    Task SeedCatalogIfEmptyAsync(CancellationToken cancellationToken = default);
    Task<List<QuizDto>> GetQuizzesAsync(CancellationToken cancellationToken = default);
    Task<QuizDetailDto?> GetQuizByIdOrSlugAsync(string idOrSlug, CancellationToken cancellationToken = default);
    Task<QuizDetailDto> CreateCustomQuizAsync(CreateQuizDto dto, Guid? mentorId, CancellationToken cancellationToken = default);
    Task<QuizDetailDto?> UpdateCustomQuizAsync(Guid id, CreateQuizDto dto, Guid? mentorId, CancellationToken cancellationToken = default);
    Task<bool> DeleteCustomQuizAsync(Guid id, Guid? mentorId, CancellationToken cancellationToken = default);
    Task<QuizAttemptDto> SubmitAttemptAsync(SubmitQuizAttemptDto dto, Guid? userId, string userName, string userEmail, CancellationToken cancellationToken = default);
    Task<List<QuizAttemptDto>> GetUserAttemptsAsync(Guid? userId, string? userEmail, CancellationToken cancellationToken = default);
    Task<QuizAnalyticsSummaryDto> GetAnalyticsSummaryAsync(string? quizIdOrSlug = null, CancellationToken cancellationToken = default);
}
