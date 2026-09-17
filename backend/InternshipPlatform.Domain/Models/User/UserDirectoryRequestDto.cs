using System;
using System.Collections.Generic;
using System.Text;

namespace InternshipPlatform.Domain.Models.User;

public class UserDirectoryRequestDto
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}
