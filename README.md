# Student Assignment Submission System (AssignHub)

A cloud-hosted web app where teachers publish assignments and students submit work and track status.
Built to demonstrate **GitHub + AWS Amplify CI/CD + AWS cloud deployment**.

**Live URL:** `<paste your Amplify URL here after deployment>`

## 1. Problem statement
Colleges often collect assignments through chat apps and email, so deadlines are missed, files get lost and teachers cannot see who has submitted. This project gives both sides one place to manage it.

## 2. Objectives
- Let teachers create, view and delete assignments, and update submission status.
- Let students view assignments, upload PDF/DOCX files and track status.
- Show role-based access (students cannot open teacher pages).
- Deploy publicly over HTTPS with automatic CI/CD from GitHub.

## 3. Technology stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (no build step) |
| Hosting + CI/CD | AWS Amplify Hosting connected to GitHub |
| Version control | Git + GitHub |
| Database (planned/optional) | Amazon DynamoDB |
| File storage (planned/optional) | Amazon S3 |
| Auth (planned/optional) | Amazon Cognito |

## 4. Features
- Landing page, login, role-based sidebar and top bar
- Student dashboard: total / submitted / pending / overdue, recent assignments, upcoming deadlines, progress bar
- Teacher dashboard: assignments, submissions received, awaiting review, reviewed
- Assignment list (with filter), details page, submission page (PDF/DOCX, 5 MB limit), submission history
- Teacher submission management with status updates (Submitted / Reviewed / Needs resubmission)
- Loading spinner, toast notifications, empty states, responsive layout

> **Current mode:** demo mode. Data is stored in the browser (`localStorage`) with realistic sample data, and login is checked in the browser. This is for demonstration only and is **not secure**. The DynamoDB/S3/Cognito design is in `backend/README.md`.

## 5. Architecture
```
Developer -> git push -> GitHub -> AWS Amplify (build + deploy) -> HTTPS URL -> Browser
                                                   (optional) API Gateway -> Lambda -> DynamoDB / S3 ; Cognito for login
```
Add your diagram as `architecture-diagram.png` (draw it in draw.io / Lucidchart using the flow above).

## 6. Repository structure
```
Student-Assignment-Submission-System/
├── frontend/        (index.html, login.html, app.html, css/, js/)
├── backend/         (DynamoDB tables, IAM policy, API plan)
├── screenshots/
├── amplify.yml
├── README.md
└── deployment-guide.md
```

## 7. Run locally
1. Clone the repo, open the `frontend` folder.
2. Start a server: `python -m http.server 8000` inside `frontend/` (or just open `index.html`).
3. Visit `http://localhost:8000`.

Demo logins (password `demo123`): `aarav@college.edu`, `priya@college.edu` (students), `meera@college.edu` (teacher).
To reset sample data, run `DB.reset()` in the browser console and reload.

## 8. CI/CD pipeline
1. Edit code and `git commit`.
2. `git push origin main`.
3. Amplify detects the new commit through its GitHub connection.
4. Amplify runs the steps in `amplify.yml` (static site, so it simply publishes `frontend/`).
5. The new version goes live at the same HTTPS URL, usually within 1-2 minutes.

## 9. Deployment
See [deployment-guide.md](deployment-guide.md).

## 10. Screenshots
Add images to `screenshots/` and link them here: landing, login, student dashboard, teacher dashboard, submission page, Amplify build success.

## 11. Security notes
No AWS keys are stored in this repo. `.gitignore` excludes `.env` files. In production use Cognito for login and IAM roles / presigned URLs for S3.
