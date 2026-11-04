# Deployment Guide (GitHub + AWS Amplify)

## Part A. Push code to GitHub
1. Create an account at github.com. Click **New repository**, name it `Student-Assignment-Submission-System`, leave it empty, and create it.
2. In the project folder run:
```bash
git init
git add .
git commit -m "Initial commit: frontend with sample data"
git branch -M main
git remote add origin https://github.com/<your-username>/Student-Assignment-Submission-System.git
git push -u origin main
```
3. Make a few extra commits for your demo (e.g. edit README, change a color) and push each one, so the commit history shows progress.

## Part B. Deploy with AWS Amplify Hosting
1. Sign in to the AWS Console and search for **AWS Amplify**.
2. Choose **Create new app** -> **GitHub** -> authorize AWS Amplify.
3. Select your repository and the `main` branch.
4. Amplify detects `amplify.yml` in the repo root. Confirm that the output directory is `frontend`.
5. Click **Save and deploy**. Wait until Provision, Build, Deploy and Verify are all green.
6. Open the `https://main.xxxxxxxx.amplifyapp.com` URL and test login on that URL.
7. Paste the URL into README.md under "Live URL".

## Part C. Prove CI/CD works
1. Change something visible (e.g. the hero text in `frontend/index.html`).
2. `git add . && git commit -m "Update hero text" && git push`
3. Watch Amplify start a new build automatically. Refresh the live URL to see the change. Take screenshots of both.

## Part D. Optional full backend (only if time allows)
Follow `backend/README.md`: create the DynamoDB tables, S3 bucket, Cognito user pool, then Lambda + API Gateway, and point `frontend/js/data.js` to the API. Never put AWS access keys in frontend code or GitHub.

## Troubleshooting
- Blank page after deploy: check the baseDirectory in `amplify.yml` is `frontend`.
- Data looks different on another device: demo mode saves data per browser. That is expected.
