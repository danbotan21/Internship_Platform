namespace InternshipPlatform.Domain.Models;

public enum ServiceErrorType
{
    Validation = 1,
    NotFound = 2,
    Forbidden = 3,
    Conflict = 4,
    Unexpected = 5,
    ExternalService = 6
}

public sealed class ServiceResult<T>
{
    public bool IsSuccess { get; private init; }

    public T? Data { get; private init; }

    public string? Error { get; private init; }

    public ServiceErrorType? ErrorType { get; private init; }

    public static ServiceResult<T> Success(T data) =>
        new() { IsSuccess = true, Data = data };

    public static ServiceResult<T> Fail(string error, ServiceErrorType errorType) =>
        new() { IsSuccess = false, Error = error, ErrorType = errorType };
}
