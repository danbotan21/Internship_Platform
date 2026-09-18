# Internship Platform - Backend API Specification

Documentație tehnică completă a endpoint-urilor REST API necesare pentru funcționalitățile **Internship Opportunities** (Atât pentru perspectiva **Student / Intern**, cât și pentru **Mentor / Companie**).

---

## 1. Structura Generală & Autentificare

### Format Răspuns Standard
```json
{
  "success": true,
  "data": { ... },
  "message": "Opțiune procesată cu succes",
  "errors": null
}
```

### Autentificare & Securitate
- Toate request-urile protejate folosesc **Bearer JWT Token** în header-ul `Authorization`.
- Role-based Access Control (RBAC):
  - `ROLE_STUDENT`: Acces la căutare oportunități, salvare, aplicare și vizualizare aplicări proprii.
  - `ROLE_MENTOR`: Acces la creare/editare oportunități proprii, gestionare status (Draft/Open/Closed), lista de aplicanți și evaluarea (Review) studenților.

---

## 2. Modulul Student / Intern (Public & Student Workspace)

### 2.1. Oportunități de Internship (Browse & Search)

#### `GET /api/opportunities`
Preia lista oportunităților publice de internship disponibile pentru studenți.

* **Query Parameters:**
  * `search` *(string, opțional)*: Căutare după titlu, companie, descriere sau tehnologii.
  * `status` *(string, opțional)*: `Open` (implicit pentru studenți).
  * `field` *(string, opțional)*: Filtrare după domeniu (ex: `Software Engineering`, `Data & Analytics`).
  * `type` *(string, opțional)*: `Full-time` | `Part-time`.
  * `locationType` *(string, opțional)*: `On-site` | `Hybrid` | `Remote`.
  * `durationCategory` *(string, opțional)*: `1-3 months` | `3-6 months` | `6+ months`.
  * `page` *(number, default 1)*
  * `limit` *(number, default 10)*

* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "opp-1",
        "title": "Software Development Intern",
        "company": "GreenTech Solutions",
        "companyLogo": "https://.../logo.png",
        "logoBg": "bg-[#1b5e3a]",
        "logoType": "leaf",
        "location": "Chișinău, MD",
        "locationType": "On-site",
        "type": "Full-time",
        "duration": "3–6 months",
        "durationCategory": "3-6 months",
        "field": "Software Engineering",
        "tags": ["Software Engineering", "Internship"],
        "postedDate": "2026-09-10",
        "deadline": "2026-12-31",
        "isSaved": false
      }
    ],
    "pagination": {
      "totalItems": 15,
      "totalPages": 2,
      "currentPage": 1
    }
  }
}
```

---

#### `GET /api/opportunities/{id}`
Preia toate detaliile unei oportunități specifice.

* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "opp-1",
    "title": "Software Development Intern",
    "company": "GreenTech Solutions",
    "location": "Chișinău, MD",
    "locationType": "On-site",
    "type": "Full-time",
    "duration": "3–6 months",
    "field": "Software Engineering",
    "tags": ["Software Engineering", "Internship"],
    "aboutCompany": "GreenTech Solutions is a technology company...",
    "aboutInternship": "Join our engineering team and work on real products...",
    "responsibilities": [
      "Work on backend and/or frontend features",
      "Collaborate with the development team"
    ],
    "requirements": [
      "Currently enrolled in Computer Science",
      "Basic knowledge of C# / .NET"
    ],
    "technologies": ["C#", ".NET", "SQL", "Git"],
    "isSaved": true,
    "hasApplied": false
  }
}
```

---

#### `POST /api/opportunities/{id}/save` & `DELETE /api/opportunities/{id}/save`
Salvează sau elimină o oportunitate din lista de favorite a studentului.

---

### 2.2. Aplicare la Internship (Application Workflow)

#### `POST /api/opportunities/{id}/apply`
Trimite o aplicare pentru oportunitatea specificată (`multipart/form-data`).

* **Headers:** `Content-Type: multipart/form-data`
* **Form Data Fields:**
  * `firstName`, `lastName`, `email`, `phoneCountryCode`, `phoneNumber`, `educationLevel`, `fieldOfStudy`, `expectedGraduation`, `availability`, `motivation`
  * `resume` *(file, required)* - Fișier PDF/DOCX
  * `coverLetter` *(file, opțional)* - Fișier PDF/DOCX
  * `additionalFiles` *(files, opțional)*

---

### 2.3. Aplicările mele (Student - My Applications)

#### `GET /api/student/applications`
Preia lista tuturor aplicărilor trimise de studentul autentificat (`Under Review`, `Accepted`, `Rejected`).

#### `GET /api/student/applications/{id}`
Preia detaliile complete ale aplicării trimise (`/my-applications/application-details?id=x`).

---

## 3. Modulul Mentor / Companie (Mentor Workspace)

### 3.1. Dashboard Oportunități Mentor (`/my-opportunities`)

#### `GET /api/mentor/opportunities`
Preia lista oportunităților create de mentor / compania sa (`Open`, `Closed`, `Draft`).

#### `PATCH /api/mentor/opportunities/{id}/status`
Schimbă starea oportunității (Publish dacă e `Draft`, Close/Reopen).

---

### 3.2. Creare & Editare Oportunitate

#### `GET /api/mentor/company-info`
Preia datele companiei mentorului.

#### `POST /api/mentor/opportunities` & `PUT /api/mentor/opportunities/{id}`
Creează sau editează o oportunitate.

---

### 3.3. Gestionare Aplicanți (`/my-opportunities/applications?id=x`)

#### `GET /api/mentor/opportunities/{id}/applications`
Preia lista tuturor aplicanților sortată automat după prioritate (`Pending` -> `Under Review` -> `Accepted` -> `Rejected`).

---

### 3.4. Pagina de Review Studenți (`/my-opportunities/review?oppId=x&userId=y`)

#### `GET /api/mentor/applications/{applicationId}/review`
Preia detaliile aplicării și evaluarea anterioară.

#### `POST /api/mentor/applications/{applicationId}/review`
Trimite decizia (`Accepted`, `Under Review`, `Rejected`) și feedback-ul (text).

---

### 3.5. Serviciu Descărcare Documente

#### `GET /api/documents/{documentId}/download`
Descarcă fișierul aplicantului.
