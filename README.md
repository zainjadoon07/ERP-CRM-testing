# Deployment Guide for IDURAR ERP/CRM

This document outlines the deployment process for the IDURAR ERP/CRM application using **GitHub Actions CI/CD pipelines**. The system supports automated deployments to **Staging** and **Production** environments.

---

## 1. CI/CD Architecture

We use **GitHub Actions** to orchestrate the deployment lifecycle. The workflows are defined in the `.github/workflows/` directory:
*   **Staging Workflow**: `staging.yml` (Triggers on push to `staging` branch)
*   **Production Workflow**: `production.yml` (Triggers on push to `main` branch)

## 2. Prerequisites & Secrets

Before deployment, ensure the following **GitHub Repository Secrets** are configured in `Settings > Secrets and variables > Actions`:

| Secret Name | Description | Required Environment |
| :--- | :--- | :--- |
| `DATABASE` | Connection string for MongoDB (Atlas or Self-Hosted) | Staging & Production |
| `JWT_SECRET` | Secret key for JSON Web Token encryption | Staging & Production |
| `CR_PAT` | GitHub Container Registry Personal Access Token (for pushing Docker images) | Production |

## 3. Deployment Environments

### 3.1 Staging Environment
**Purpose**: Validation of new features, bug fixes, and integration testing.

**How to Deploy:**
1.  Create a feature branch or fix branch.
2.  Merge your changes into the `staging` branch.
3.  Push to `origin staging`.

**Automated Steps (Pipeline):**
1.  **Checkout**: Pulls the latest code.
2.  **Build**: Builds the Backend Docker image to ensure compilation success.
3.  **Test**:
    *   Runs Backend Unit Tests (Jest).
    *   Runs Backend API Tests (Newman).
    *   Runs Frontend E2E Tests (Cypress).
    *   Runs Stress Tests (Artillery).
4.  **Artifact Upload**: Uploads coverage reports and test screenshots (on failure).
5.  **Deploy**: (Mock) Simulates deployment to a staging server (e.g., restarting PM2 service).

### 3.2 Production Environment
**Purpose**: Live environment for end-users. Stable and tested builds only.

**How to Deploy:**
1.  Ensure the `staging` pipeline has passed successfully.
2.  Create a Pull Request from `staging` to `main`.
3.  Merge the Pull Request.
4.  Push to `origin main`.

**Automated Steps (Pipeline):**
1.  **Validation**: Runs a "Smoke Test" suite to verify critical paths (Login, API Health).
2.  **Build & Publish**:
    *   Builds the optimized Production Docker Image.
    *   Tags the image with the commit SHA and `latest`.
    *   Pushes the image to **GitHub Container Registry (ghcr.io)**.
3.  **Deploy**:
    *   Triggers the production server to pull the new image.
    *   Restarts the container.
    *   Runs database migrations (if any).

## 4. Monitoring & Rollback

### Monitoring Deployments
*   Go to the **Actions** tab in the GitHub repository.
*   Click on the running workflow to view real-time logs for each step.
*   **Green Check**: Success.
*   **Red X**: Failure (Deployment stops automatically).

### Rollback Strategy
If a deployment introduces a critical bug:
1.  **Identify the last stable commit** hash.
2.  **Revert** the problematic commit in git:
    ```bash
    git revert <bad-commit-hash>
    git push origin main
    ```
3.  The pipeline will automatically trigger and deploy the reverted (stable) code.

## 5. Local Deployment (Manual)

To run the application locally (mimicking production):
1.  **Backend**:
    ```bash
    cd backend
    npm ci
    npm start
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm run build
    npx serve -s dist -l 3000
    ```

---
**Verified by**: QA & DevOps Team
**Date**: December 2025
