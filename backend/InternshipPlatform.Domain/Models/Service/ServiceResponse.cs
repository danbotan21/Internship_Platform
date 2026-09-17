using System;
using System.Collections.Generic;
using System.Text;

namespace InternshipPlatform.Domain.Models.Service;

public class ServiceResponse
{
    public bool IsSuccess { get; set; }
    public string? Message { get; set; }
    public object? Data { get; set; }

    //HttpStatusCode 404
}
