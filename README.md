# Internflow

Internflow is a web platform for managing internships. It covers the whole process, from a company posting an opportunity to a student receiving a certificate at the end.

We built it as a team of eight interns at Amdaris in September 2026, working in sprints with a shared backlog in Azure DevOps and designs in Figma.

## Stack

| Area | Choice |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API |
| Data access | Entity Framework Core 10, Npgsql |
| Database | PostgreSQL 17 in Docker |
| Auth | JWT with refresh token rotation, BCrypt |
| API docs | Swagger |
| Frontend | React 19, TypeScript, Vite |
| Routing and styling | React Router 7, Tailwind CSS 4 |
| Documents | react-pdf, docx-preview, jsPDF |
| Integrations | GitHub REST API |

## Features

- **Authentication.** Registration, sign-in and sign-out. The access token lives 15 minutes and is refreshed automatically when the API returns `401`.
- **Opportunities.** Mentors publish and close opportunities. Students apply with a CV and cover letter and follow the status of their applications.
- **Contributions.** Students submit their work with files, links or GitHub commits and pull requests as evidence, add co-authors and revise after mentor feedback.
- **Evaluations.** Mentors evaluate students against a rubric.
- **Progress.** Logged hours and milestones against a target of 200 hours, plus an overview of all students for mentors.
- **Documentation.** Compliance documents that both student and mentor sign. Mandatory forms block other actions until they are signed. Certificates are generated as PDF.
- **Messaging.** Direct messages, channels, threads and read receipts.
- **Resources.** Knowledge base articles with categories, search, drafts and favourites.
- **Quizzes.** Mentors create quizzes. Attempts are recorded on video.
- **Admin panel.** Dashboard, user directory with deactivation and role changes, company verification requests, suspension of verified companies.

## Architecture

The backend has four projects, each depending only on the next one: `API → BusinessLayer → DataAccess → Domain`.

```
backend/
  InternshipPlatform.API/            # controllers, auth, DI, migrations and seeding on startup
  InternshipPlatform.BusinessLayer/  # business rules, grouped by module
  InternshipPlatform.DataAccess/     # AppDbContext, entity configurations, migrations, seed data
  InternshipPlatform.Domain/         # entities, enums, request and response models
frontend/
  src/
    api/          # HTTP client, session storage, endpoint calls
    pages/        # screens, admin panel in pages/admin
    components/   # UI components grouped by module
    hooks/ context/ routes/ types/
compose.yaml      # PostgreSQL for local development
package.json      # runs the database, API and frontend together
```

## Getting started

Requirements: [.NET SDK 10.0.100](https://dotnet.microsoft.com/download/dotnet/10.0) or newer (see [`global.json`](global.json)), [Node.js](https://nodejs.org/) 20+, [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/danbotan21/Internship_Platform.git
cd Internship_Platform

npm install
npm install --prefix frontend
dotnet tool restore

cp .env.example .env    # Windows: copy .env.example .env

npm start
```

`npm start` brings up PostgreSQL and then runs the API and frontend side by side. The API applies migrations on startup and, in Development, fills the database with demo data. Settings in `appsettings.Development.json`, including the JWT signing key, are meant for local development only.

| Service | URL |
|---|---|
| Frontend | http://127.0.0.1:5173 |
| API | http://localhost:5080 |
| Swagger | http://localhost:5080/swagger |

Vite proxies `/api` and `/uploads` to the API, so the frontend works without extra configuration.

PostgreSQL listens on port 5432. If a local PostgreSQL already uses that port, stop it first, otherwise the container won't start.

### Admin account

New accounts are registered as students, so set an admin account before the first start:

```bash
dotnet user-secrets set "Bootstrap:AdminEmail" "admin@example.com" --project backend/InternshipPlatform.API
dotnet user-secrets set "Bootstrap:AdminPassword" "<password>" --project backend/InternshipPlatform.API
```

The admin can then change other users' roles in Admin → Users.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Database, API and frontend |
| `npm run dev` | API and frontend, if the database is already running |
| `npm run db:up` / `npm run db:down` | Start or stop PostgreSQL |
| `npm run dev:api` | API only |
| `npm run dev:web` | Frontend only |
| `npm run build --prefix frontend` | Type check and production build |
| `dotnet ef migrations add <Name> --project backend/InternshipPlatform.DataAccess --startup-project backend/InternshipPlatform.API` | New migration |

## Status

The project was built during the internship in September 2026. The Overview, Tasks, Reports, Calendar, Skills and Audit Log pages are planned but not implemented yet.

## Team

Daniel Botan, Mihail Goncearov, Daniel Chigaianu, Daniel Chitanu, Gicu Caraman, Sergiu Negara, Valeriu Bulgaru, Veaceslav Nagoreanschi.

Mentor: Ion Chiriac, [Amdaris](https://amdaris.com).