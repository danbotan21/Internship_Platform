# Project Memory: Internflow (Internship Platform)

> **File Purpose**: This document is a living project memory file and technical blueprint for **Internflow**. It must be kept up to date throughout the entire development process. It provides AI coding assistants and developers with the persistent context needed to make informed, consistent decisions quickly without re-explaining the codebase.

---

## 1. Project Overview

- **Project Name**: Internflow (Repository: `Internship_Platform`)
- **Main Purpose**: A comprehensive, full-stack platform designed to manage the end-to-end university and corporate internship lifecycle. It bridges students (interns), company mentors/recruiters, and academic coordinators/administrators.
- **Key Goals**:
  - Centralize internship discovery, application workflows, and candidate reviews.
  - Track student progress, logged work hours, task milestones, and supervisor feedback.
  - Manage student contributions and work evidence with peer attribution and GitHub verification.
  - Provide a secure Documentation Vault with digital signatures, compliance gating, and automated certificate generation.
  - Offer integrated communication (direct messaging, topic channels, announcements) and proctored technical skill assessment quizzes.
  - Empower administrators to verify companies, manage user lifecycles, and monitor platform activity.
- **Target Users & Roles**:
  - `Student`: Browses opportunities, submits applications, tracks hours/milestones, creates contribution drafts, attaches evidence, signs compliance documents, takes quizzes, and chats with mentors.
  - `Mentor`: Posts opportunities, reviews student applications, inspects contributions, gives structured feedback, logs supervisor evaluations, creates custom quizzes, and signs intern documentation.
  - `Company` / `Recruiter`: Manages organization profile, posts listings, coordinates mentorship.
  - `Admin`: Oversees user directories, approves/rejects company verification requests, activates/deactivates accounts, views system audits.

---

## 2. Technology Stack

### Backend
- **Framework**: .NET 10 (`net10.0`), C# 12
- **SDK**: Microsoft .NET SDK 10.0.100 (configured in `global.json`)
- **Web API**: ASP.NET Core Web API with Controllers
- **Data Access & ORM**: Entity Framework Core 10 (`Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.3)
- **Security & Cryptography**: `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.12, `BCrypt.Net-Next` 4.2.0, `System.IdentityModel.Tokens.Jwt` 8.22.0
- **API Documentation**: Swashbuckle Swagger / OpenAPI 10.2.3 (`/swagger`)
- **External Integrations**: GitHub REST API client (`GitHubApiClient` via `HttpClient`, cached with `IMemoryCache`)

### Frontend
- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Language**: TypeScript 6 (`~6.0.2`), strict mode enabled
- **Build Tool / Bundler**: Vite 8 (`vite` 8.3.0) with `@vitejs/plugin-react`
- **Routing**: React Router DOM v7 (`react-router-dom` 7.18.4)
- **Styling**: Tailwind CSS v4 (`tailwindcss` 4.3.3, `@tailwindcss/vite`) + custom vanilla CSS rules
- **Icons**: Lucide React (`lucide-react` 1.47.0)
- **Specialized UI / Document Libraries**:
  - Document & PDF rendering: `pdfjs-dist`, `react-pdf`, `docx-preview`, `jspdf` (certificate PDF generation)
  - 3D Visuals: `three` 0.186.0 (for `FluidBackground.tsx`)
  - Video Proctoring: WebRTC `MediaRecorder` API + `fix-webm-duration` for quiz video recording capture

### Database & Storage
- **Primary Database**: PostgreSQL 17 (Dockerized `postgres:17-alpine`)
- **Local File Storage**:
  - Vault & application files: `backend/InternshipPlatform.API/wwwroot/uploads`
  - Quiz recordings & proctored results: `recorded-sessions/` (videos `.webm` + `quiz_results.json`)

### DevOps & Tooling
- **Containerization**: Docker Compose (`compose.yaml`) for PostgreSQL
- **Dev Runner**: Root `package.json` using `concurrently` (runs API and Frontend simultaneously)

---

## 3. Architecture & Project Structure

### Repository Structure
```
Internship_Platform/
├── backend/
│   ├── InternshipPlatform.slnx               # .NET 10 solution file
│   ├── InternshipPlatform.API/               # Presentation layer: ASP.NET Core API
│   │   ├── Controllers/                      # 19 REST Controllers
│   │   ├── Infrastructure/                   # Directory adapters, GitHub client, claim helpers
│   │   ├── Properties/launchSettings.json    # Development launch profile (Port 5080)
│   │   ├── appsettings.json                  # Connection strings, JWT configuration
│   │   ├── appsettings.Development.json      # Dev DB credentials
│   │   └── Program.cs                        # DI container, middleware pipeline, DB migration/seed
│   ├── InternshipPlatform.BusinessLayer/     # Application logic & domain workflows
│   │   ├── Admin/                            # Company, user lifecycle, verification services
│   │   ├── Auth/                             # AuthService, TokenService, password hashing
│   │   ├── Messaging/                        # Chat and notifications business service
│   │   ├── Opportunity/                      # Opportunity & Application logic and actions
│   │   ├── Progress/                         # Hours, milestone, task logging service
│   │   ├── Resources/                        # Knowledge base service and queries
│   │   ├── Services/                         # DocumentService, PDF/sign logic
│   │   ├── Structure/                        # Contribution actions & file storage
│   │   ├── Users/                            # User logic & actions
│   │   └── DTOs/ / Interfaces/               # Contracts & data transfer objects
│   ├── InternshipPlatform.DataAccess/        # Data persistence layer
│   │   ├── Configurations/                   # EF Core entity type configurations
│   │   ├── Context/                          # AppDbContext (AppDbContext.cs, AppDbContext.Contributions.cs)
│   │   ├── Migrations/                       # EF Core PostgreSQL migrations
│   │   ├── Resources/                        # Resource repositories
│   │   └── Seed/                             # SeedData (72 test users, companies, demo memberships)
│   └── InternshipPlatform.Domain/            # Enterprise Domain Layer (Zero business dependencies)
│       ├── Entities/                         # Document, Application, Opportunity, Contribution, Resource...
│       ├── Enums/                            # Domain enums
│       ├── Models/                           # API request/response DTOs & ServiceResult
│       └── *.cs                              # User, Conversation, Message, Milestone, etc.
├── frontend/                                 # Vite + React 19 Frontend
│   ├── public/                               # Static assets, logo, dummy.pdf
│   ├── src/
│   │   ├── api/                              # HTTP clients, auth session store, endpoint bindings
│   │   ├── components/                       # UI components (admin, layout, quizzes, docs, messages)
│   │   ├── context/                          # UserRoleContext
│   │   ├── data/                             # Mock/catalog data (quizzesData.ts)
│   │   ├── hooks/                            # useAuth, useMessaging, useDocumentation, useUserRole
│   │   ├── pages/                            # Top-level route pages (Workspaces, Admin, Quizzes)
│   │   ├── routes/                           # AppRoutes.tsx
│   │   ├── services/                         # Client-side helpers (quizResultsDb.ts, docService.ts)
│   │   ├── types/                            # TypeScript interfaces
│   │   ├── App.tsx                           # Root component (AuthModal gate)
│   │   ├── main.tsx                          # Root entry point with providers
│   │   └── index.css                         # Tailwind CSS & global styling
│   └── package.json                          # Frontend dependencies & scripts
├── recorded-sessions/                        # Persistent directory for quiz recordings & results
├── compose.yaml                              # Docker Compose configuration for PostgreSQL
└── package.json                              # Dev orchestrator script runner
```

### Communication Flow
1. **Frontend to Backend**: REST calls using browser `fetch`.
   - `frontend/src/api/client.ts` manages bearer tokens with transparent refresh interception on HTTP `401`.
   - `frontend/src/api/http.ts` provides additional utility requests with identity headers (`X-User-Id`, `X-User-Role`, `Authorization`).
2. **Backend Architecture Layers**:
   - `Controllers`: Thin API endpoints, map HTTP routes, extract user ID claims via `User.TryGetUserId()`, delegate to Business Layer.
   - `BusinessLayer`: Contains domain validation, role access logic, and transactions. Returns typed `ApiResponse<T>` or `ServiceResult<T>`.
   - `DataAccess`: EF Core PostgreSQL querying via `AppDbContext`, repository implementations, and migration handling.
   - `Domain`: Clean POCO entities and common contract models without dependencies on external frameworks.

---

## 4. Domain Model & Core Entities

### User & Authentication
- `User`: Core user model (`Id` [Guid], `Email`, `PasswordHash`, `FullName`, `Role` [UserRole: Student, Mentor, Admin, Company], `Status` [Active, Deactivated], `University`, `AcademicGroup`, `Programme`, `EmailVerified`, `CreatedAt`, `LastLoginAt`).
- `RefreshToken`: Cryptographic token linked to a `User` (`ExpiresAtUtc`, `RevokedAtUtc`).
- `ContactInfo`: Embedded contact details (`Phone`, `Slack`, `OfficeLocation`, `Timezone`, `PreferredChannel`).

### Companies & Organizations
- `Company`: Legal name, registration number, website, headquarters, industry, size, and verification status (`Active`, `Suspended`).
- `CompanyMembership`: Maps `User` to `Company` with role (`Owner`, `Admin`, `Mentor`, `Recruiter`).
- `CompanyVerificationRequest`: Administrative audit request submitted by company reps, reviewed by platform admins.

### Opportunities & Applications
- `Opportunity`: Posted by mentors/companies. Contains `Title`, `Field`, `Type` (Full-time/Part-time), `LocationType` (On-site/Hybrid/Remote), `Location`, `Duration`, `Responsibilities`, `Requirements`, `Technologies`, `Status` (`Draft`, `Open`, `Closed`), deadlines.
- `Application`: Student application linked to an `Opportunity`. Contains contact details, education fields, motivation, file paths (`ResumeUrl`, `CoverLetterUrl`, `AdditionalFiles`), `Status` (`Pending`, `UnderReview`, `Accepted`, `Rejected`), mentor review feedback.

### Contributions & Peer Attribution
- `Contribution`: A student's verifiable portfolio unit of work. Contains `Status` (`Draft`, `Submitted`, `InReview`, `Approved`, `ChangesRequested`, `Rejected`) and revision pointers.
- `ContributionRevision`: Versioned snapshot of the work (`RevisionNumber`, `Title`, `Category`, `Summary`, `WorkStartDate`, `WorkEndDate`).
- `ContributionEvidence`: Work artifacts attached to a revision:
  - Evidence types: `File` (uploaded binary), `Link` (URL), `GitHub` (commit SHA, PR number, live CI check status).
- `ContributionCollaborator`: Multi-student co-authorship. Allows collaborators to `Confirm` or `Dispute` their credited involvement.
- `ContributionReview` & `ContributionReviewCheck`: Mentor rubric evaluation and checklists.

### Documentation Vault & Compliance
- `Document`: Compliance forms, evaluations, and reports. Fields: `Title`, `Category`, `FileType`, `Version`, `Status` (`Pending`, `Approved`, `Rejected`), `SigningStatus` (`Pending`, `SignedByStudent`, `SignedByMentor`, `Complete`), `IsMandatory`.
- `DocumentAudit`: Audit log tracking all actions performed on vault documents.
- Compliance Gate (US 730): Blocks subsequent student actions until mandatory Health & Safety compliance forms are signed.

### Messaging & Channels
- `Conversation`: Direct messages (`Direct`) or channels (`Channel`). Channels have `Kind` (General, Announcements, Topics) and `Visibility` (Public, Private).
- `Message`: Rich messaging with parent-child threading, edits, pinned state, and attachments.
- `MessageDelivery` & `MessageRead`: Real-time read receipts and delivery tracking.
- `MessagingNotification`: System and user-triggered notification feed.

### Progress & Resources
- `Milestone` & `TaskLogEntry`: Tracking against target internship hours (configured in `appsettings.json`, e.g., 200 hours).
- `Resource` & `ResourceFavorite`: Knowledge base articles written in HTML/Markdown with categories and tags.

---

## 5. Backend Architecture & Endpoints

### Controllers Overview (`backend/InternshipPlatform.API/Controllers`)
1. **`AuthController`** (`/api/auth`): `register`, `login`, `refresh`, `logout`.
2. **`UserController`** (`/api/users`): `/me` current user profile, `/api/mentor/company-info`.
3. **`OpportunityController`** (`/api/opportunities` & `/api/student/applications` & `/api/mentor/opportunities`): Complete public browsing, applying with multipart files, student application tracker, mentor listing management, candidate review, and applicant document download.
4. **`ContributionsController`** (`/api/contributions`): Student draft management, multi-evidence uploads (links, files up to 6MB, GitHub), submission.
5. **`ContributionCollaboratorsController`** & **`AttributedContributionsController`**: Collaborator management and student participation dispute/confirmation.
6. **`ContributionGitHubController`** (`/api/contributions/github`): GitHub repositories, branches, commits, and pull requests fetching.
7. **`MentorContributionsController`** (`/api/contributions/mentor`): Mentor view of student contributions and rubric review submission.
8. **`DocumentsController`** (`/api/Documents`): Vault search/filtering, file upload, status patch (Approve/Reject with mandatory reason), digital signing, compliance gate status/unlock, batch operations, official certificate generation.
9. **`MessagingController`** (`/api/messaging`): Direct message initiation, channel CRUD, join/leave, message posting, thread replies, mark-as-read, contact updates.
10. **`ProgressController`** (`/api/progress`): `/me` student hours and milestones, `/students` mentor overview, `/tasks` student task logging, milestone updates, supervisor feedback.
11. **`ResourcesController`** (`/api/resources`): Browse, search, filter, create, edit, delete, favorite, and toggle draft status for knowledge articles.
12. **`QuizRecordingsController`** (`/api/recordings` & `/api/save-recording`): Video upload endpoint for proctored quiz sessions (up to 100MB).
13. **`QuizResultsController`** (`/api/quiz-results`): Get and save quiz attempt results to persistent JSON storage.
14. **`AdminDashboardController`** (`/api/admin/dashboard`): Platform metrics (active users, companies, pending verifications).
15. **`AdminUsersController`** (`/api/admin/users`): User directory search, user details, account deactivation/reactivation.
16. **`AdminCompaniesController`** (`/api/admin/companies`): Company directory, details, suspend/unsuspend.
17. **`AdminVerificationController`** (`/api/admin/verification`): Queue of company verification requests with approve/reject workflow.

### Business Layer Patterns
- **Actions vs Logic**: Dedicated action classes (e.g., `OpportunityActions`, `UserActions`, `ApplicationActions`, `ContributionActionExecution`) handle database queries and mutations, paired with Logic services (`OpportunityLogic`, `ApplicationLogic`, `UserLogic`) orchestrating domain validation and envelopes.
- **Result Envelopes**:
  - `ApiResponse<T>`: Standard JSON response `{ success, data, message, errors }`.
  - `ServiceResult<T>`: Business layer result containing domain error types (`Validation`, `NotFound`, `Forbidden`, `Conflict`, `ExternalService`).

---

## 6. Frontend Architecture & Design System

### Core State & Providers Hierarchy
In `frontend/src/main.tsx`:
```tsx
<BrowserRouter>
  <AuthProvider>           {/* Manages session, tokens, login/logout */}
    <UserRoleProvider>     {/* UI perspective toggle (Student / Mentor / Admin) */}
      <App />              {/* AuthModal gate if unauthenticated, else AppRoutes */}
    </UserRoleProvider>
  </AuthProvider>
</BrowserRouter>
```

### Route Structure (`frontend/src/routes/AppRoutes.tsx`)
- **Main Layout (`/`)**:
  - Work: `/` (Overview), `/internship-progress`, `/tasks`, `/attendance`, `/reports`, `/contributions/*`, `/evaluation`, `/opportunities`, `/my-applications`, `/my-opportunities`, `/quizzes`, `/custom-quizzes`.
  - Connect: `/messages`, `/calendar`, `/documentation`, `/resources` (and `/resources/:resourceSlug`, `/resources/create`).
  - Manage: `/skills`, `/audit-log`.
- **Admin Layout (`/admin`)**:
  - `/admin/overview`, `/admin/users`, `/admin/users/:userId`, `/admin/verification`, `/admin/verification/:requestId`, `/admin/companies`, `/admin/companies/:companyId`.

### API & Session Interception
- `frontend/src/api/session.ts`: Persists token in `localStorage['internflow.session']`. Holds session outside React so non-React fetch utilities can read tokens directly.
- `frontend/src/api/client.ts`: Automatic token refresh loop. If a request returns `401 Unauthorized`, it attempts `/api/auth/refresh`. Multiple concurrent requests coalesce into a single refresh call.

### Design Aesthetics & UI Conventions
- **Color Scheme**: Deep forest green brand identity (`#1e3a2c`), dark text (`#14211b`), neutral background (`#f5f7f6`), accented by emerald/mint tones (`#1b5e3a`, `#10b981`).
- **Typography & Components**: Modern SaaS layout with collapsible navigation, glassmorphic metric cards, interactive status badges (`Pending`, `Under Review`, `Approved`, `Rejected`), and custom-styled dropdown selects (`CustomSelect.tsx`).
- **Proctoring**: Interactive WebRTC screen and webcam preview during quiz taking with countdown timers and automated recording upload on submission.

---

## 7. Database & Migrations

- **Database Engine**: PostgreSQL 17 on port `5432`.
- **EF Core Context**: `AppDbContext` is configured across two partial files:
  - `AppDbContext.cs`: Core entities (Users, RefreshTokens, Opportunities, Applications, Documents, Messaging, Resources, Milestones).
  - `AppDbContext.Contributions.cs`: Contributions module tables, check constraints, foreign keys, and cascading rules.
- **Seeded Data (`SeedData.cs`)**:
  - Automatically seeds on first startup in Development environment.
  - Generates 72 test users across UTM academic groups (`UTM-02`, `FAF-231`, etc.), 6 companies (`TechNova SRL`, `Amdaris Moldova SRL`, `Endava Chisinau SRL`, `Orange Systems SRL`, `Simpals SRL`, `Fagura SRL`), company memberships, and verification requests.
  - Team members seeded: Mihail Goncearov, Ion Chiriac, Daniel Botan, Daniel Chigaianu, Daniel Chitanu, Gicu Caraman, Sergiu Negara, Valeriu Bulgaru, Veaceslav Nagoreanschi.
- **Initial Document Seeds**: Pre-seeded compliance forms and reports (e.g., Spring Milestone Report, Institutional Sign Off Agreement, Health & Safety Compliance Form).

---

## 8. Development Setup & Commands

### Prerequisites
- **.NET 10 SDK** (`dotnet --version` >= 10.0.100)
- **Node.js** (v20+ recommended) & **npm**
- **Docker Desktop** (for PostgreSQL)

### Configuration Files
- `.env` in root:
  ```env
  POSTGRES_DB=internship_platform
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  ```
- Backend `appsettings.Development.json`:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=internship_platform;Username=postgres;Password=postgres"
  }
  ```

### Key Commands
| Action | Command | Details |
|---|---|---|
| **Start Full Stack** | `npm run start` | Spins up PostgreSQL docker container, then starts API + Frontend |
| **Start Dev Only** | `npm run dev` | Runs backend API & Vite frontend concurrently |
| **Start Database** | `npm run db:up` | `docker compose up -d` |
| **Stop Database** | `npm run db:down` | `docker compose down` |
| **Run API Only** | `npm run dev:api` | `dotnet run --project backend/InternshipPlatform.API` (Port 5080) |
| **Run Frontend Only**| `npm run dev:web` | `npm run dev --prefix frontend` (Port 5173) |
| **EF Migrations** | `dotnet ef migrations add <Name> --project backend/InternshipPlatform.DataAccess --startup-project backend/InternshipPlatform.API` | Add new migration |

---

## 9. Current Development State

### Current Feature Being Worked On
- Opportunities & Applications module refinement (DTO bindings, student application details `/my-applications/application-details`, and mentor applicant review workflow `/my-opportunities/review`).

### Recently Completed Work
- Merged upstream updates (`origin/main`) incorporating:
  - Documentation UI overhaul with modern glassmorphism and platform theme.
  - Documentation link in sidebar navigation.
  - Migration fixes for PostgreSQL string-to-integer casts and table existence checks.
  - TypeScript typing alignment in `Sidebar.tsx`, `VaultTable.tsx`, and `useAuth.tsx`.
- Created comprehensive `MEMORY.md` persistent project memory.

### Next Planned Work
- Implement placeholder pages: `Overview`, `Tasks`, `Reports`, `Evaluation`, `Calendar`, `Skills`, `AuditLog`.
- Connect Attendance module frontend to backend persistence (currently using mock data).
- Consolidate dualities: unify duplicated sidebars (`components/Sidebar.tsx` vs `components/layout/Sidebar.tsx`) and HTTP client wrappers (`client.ts` vs `http.ts`).

### Known Problems & Gotchas
- **Two `Notification` entities**:
  - `InternshipPlatform.Domain.Notification` (Messaging module).
  - `InternshipPlatform.Domain.Entities.Notification` (Resources module).
  - Aliased in `AppDbContext.cs` as `MessagingNotification` and `ResourceNotification`.
- **Two Sidebar components**:
  - `frontend/src/components/layout/Sidebar.tsx` is the active sidebar rendered by `Layout.tsx`.
  - `frontend/src/components/Sidebar.tsx` is an alternative/legacy version. Do not confuse the two.
- **Two HTTP utility clients**:
  - `frontend/src/api/client.ts` has automatic JWT token refresh.
  - `frontend/src/api/http.ts` provides raw fetch helpers with custom headers.
- **Quiz Results Storage**:
  - Quizzes and attempts are currently stored in `recorded-sessions/quiz_results.json` and client `localStorage` rather than EF Core PostgreSQL tables.

### Blocked Tasks
- *None currently.*

---

## 10. Important Decisions

1. **Separation of Concerns (Clean/Layered Architecture)**:
   - *Decision*: Controllers are strictly thin HTTP entry points; business rules and validation belong exclusively in `InternshipPlatform.BusinessLayer`.
   - *Rationale*: Keeps domain and business rules testable and decoupled from HTTP transport.
2. **Result Envelopes over Exceptions**:
   - *Decision*: Use `ApiResponse<T>` and `ServiceResult<T>` instead of relying on uncaught exceptions for domain errors.
   - *Rationale*: Provides predictable HTTP error payloads for the frontend client.
3. **Transparent Client-Side JWT Refresh**:
   - *Decision*: Handle token refresh in `frontend/src/api/client.ts` intercepting HTTP `401`.
   - *Rationale*: Prevents abrupt user logouts when short-lived access tokens expire during active sessions.
4. **Direct File System Storage for Media/Recordings**:
   - *Decision*: Quiz proctoring recordings (.webm) and document uploads are stored on disk (`recorded-sessions/` and `wwwroot/uploads`), not as BLOBs in PostgreSQL.
   - *Rationale*: Prevents relational database bloat from large binary uploads.
5. **Role-Based Workspace Personalization**:
   - *Decision*: A unified layout dynamically adjusts navigation items between Student and Mentor views (`navigationFor(role)` in `navigation.ts`).
   - *Rationale*: Avoids duplicating entire layout scaffolding between different personas.
6. **No Mock Data for Opportunities & Applications**:
   - *Decision*: All static mock data (`MOCK_OPPORTUNITIES`, `MOCK_MENTOR_OPPORTUNITIES`, `INITIAL_DATA`, fake applicants) were purged from frontend opportunity and application pages. The frontend relies exclusively on live API endpoints, displaying clean empty states (e.g. *"We're currently out of internships!"*) when the database has no listings.
   - *Rationale*: Ensures accurate production behavior and avoids stale/confusing dummy listings.
7. **Attendance Navigation Hidden**:
   - *Decision*: The Attendance item was removed from student/mentor sidebar navigation configurations (`navigation.ts` and `Sidebar.tsx`).
   - *Rationale*: Hides incomplete or WIP attendance workflows until backend integration is finalized.
8. **Explicit Validation & Human-Readable Error Messages for Forms**:
   - *Decision*: In `OpportunityApply.tsx` and application forms, all steps enforce strict client-side validation before continuing, displaying inline red validation messages directly under each missing field (e.g., "Last name is required") and an alert banner listing missing fields. In `api/opportunities.ts` (`handleApiResponse`), ASP.NET Core `ValidationProblemDetails` dictionary objects (`errors: { Field: [...] }`) are parsed and formatted into clear field-specific messages instead of generic `"HTTP Error 400: Bad Request"`.
   - *Rationale*: Users must immediately see exactly which fields were left incomplete or failed validation rather than seeing ambiguous HTTP status errors.
9. **Opportunity Visibility and Application Rules by Status**:
   - *Decision*: The public/student opportunities page (`/opportunities`) and `OpportunityActions.GetOpenOpportunitiesAsync` only return published opportunities (`Open` and `Closed`). `Draft` opportunities are strictly excluded from public listings and can only be accessed by the owning mentor in `MyOpportunities`.
   - *Application Rules*:
     - `Open`: Students/interns can view and apply (active "Apply Now" button).
     - `Closed`: Visible in the listings with a "Closed" badge; "Apply Now" button is replaced by disabled "Applications Closed"; backend `ApplicationLogic.ApplyAsync` rejects submissions for closed opportunities.
     - `Draft`: Completely hidden from public view; applications blocked client-side and server-side.
   - *Rationale*: Protects unfinished mentor drafts from public exposure while allowing past/closed opportunities to remain visible for reference without accepting new applications.

---

## 11. User Preferences

*(Stable preferences explicitly stated by the user or repeatedly demonstrated will be recorded here.)*
- **Architecture**: Strict layering must be preserved (thin controllers, logic in BusinessLayer, pure domain entities).
- **Error Handling & UX**: Never display generic "Bad Request" or raw HTTP codes to users. Always extract and show the exact missing or invalid fields directly on the UI (both client-side inline validation and formatted backend error responses).
- **Explanation Style**: Concise, direct, and actionable explanations focused on concrete code changes.
- **Implementation Style**: Complete, working code over partial snippets or placeholders.
- **Conventions**: Maintain existing naming, folder structure, and aesthetic palette.

---

## 12. AI Interaction Preferences

### Likes
- Explaining the technical rationale behind non-obvious architecture or design decisions.
- Reusing existing project services, DTOs, and components before introducing new abstractions.
- Providing complete, drop-in code updates when requested.
- Flagging potential breaking changes or edge cases before making edits.
- Keeping solutions lean, practical, and consistent with the existing codebase structure.

### Dislikes
- Introducing unnecessary abstraction layers or overengineering straightforward features.
- Repeating previously established context in long conversational summaries.
- Inventing requirements, entities, or libraries not grounded in the actual codebase.
- Modifying unrelated code or files outside the scope of the request.
- Deviating from existing conventions without an explicit reason.

---

## 13. Operational Protocol for AI Pair Programmers

When working on this project in future sessions, follow these mandatory rules:

1. **Review Memory First**: Before making significant changes, review `MEMORY.md`, verify current conventions, and inspect related code.
2. **Update After Meaningful Prompts**:
   - At the end of every user interaction, silently evaluate: *"Did this interaction introduce anything that future AI sessions should know?"*
   - If yes (new requirements, decisions, preferences, completed features, or bug discoveries), update `MEMORY.md`.
   - Do not mention that memory was updated unless explicitly asked.
3. **Learn from Corrections**: When corrected by the user, immediately record the general rule under `## Important Decisions`, `## User Preferences`, or `## AI Interaction Preferences`.
4. **Never Invent Memory**: If a detail is uncertain, explicitly mark it `UNKNOWN` or `NEEDS CONFIRMATION`.
5. **Update Existing Context Instead of Duplicating**: Replace outdated information directly rather than appending contradictory entries.
6. **Keep It Concise**: Record context and architectural decisions rather than full code implementations.
7. **Priority of Information**:
   1. Explicit instructions from the current user prompt.
   2. Explicit project decisions recorded in `MEMORY.md`.
   3. Current codebase implementation.
   4. Established user preferences.
   5. Older assumptions.
