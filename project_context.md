# Project Context: Notes App Microservices

## Overview
This project is a microservices-based Notes Application backend built with Python (FastAPI). It consists of two main services: an Authentication Service and a Notes Service, each with its own PostgreSQL database. It looks like the project is deployed using Docker Compose.

## Infrastructure
**Orchestration**: Docker Compose (`docker-compose.yml`)
**Services**:
1.  **`auth-service`**
    -   **Type**: FastAPI Application
    -   **Port**: Maps host `8001` to container `8000`
    -   **Dependencies**: `auth-db`
    -   **Environment**: Connection to `auth-db`, `SECRET_KEY`.
2.  **`notes-service`**
    -   **Type**: FastAPI Application
    -   **Port**: Maps host `8002` to container `8000`
    -   **Dependencies**: `notes-db`
    -   **Environment**: Connection to `notes-db`, `SECRET_KEY`, AWS Credentials (for S3).
3.  **`auth-db`**
    -   **Type**: PostgreSQL 13
    -   **Port**: Maps host `5432` to container `5432`
    -   **Volume**: `auth_db_data`
4.  **`notes-db`**
    -   **Type**: PostgreSQL 13
    -   **Port**: Maps host `5433` to container `5432` (**Note**: Host port is 5433 to avoid conflict)
    -   **Volume**: `notes_db_data`

## File Structure

### Root Directory
-   `docker-compose.yml`: Defines the multi-container setup.
-   `.env.example`: Template for environment variables.
-   `auth-service/`: Source code for authentication.
-   `notes-service/`: Source code for notes management.

### Service: `auth-service`
**Path**: `./auth-service`
**Key Files**:
-   `Dockerfile`: Python 3.9-slim, dependencies installed, runs `uvicorn app.main:app`.
-   `requirements.txt`: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `passlib[bcrypt]`, `python-jose[cryptography]`, `python-multipart`.
-   `app/`:
    -   `main.py`: Entry point.
    -   `auth.py`: Authentication logic.
    -   `models.py`: Database models (likely User).
    -   `schemas.py`: Pydantic models.
    -   `database.py`: DB connection setup.

### Service: `notes-service`
**Path**: `./notes-service`
**Key Files**:
-   `Dockerfile`: Python 3.9-slim, dependencies installed, runs `uvicorn app.main:app`.
-   `requirements.txt`: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `boto3`, `requests`, `python-jose`, `python-multipart`.
-   `app/`:
    -   `main.py`: Entry point.
    -   `s3_utils.py`: AWS S3 interactions.
    -   `models.py`: Database models (likely Note).
    -   `schemas.py`: Pydantic models.
    -   `database.py`: DB connection setup.

## Configuration Requirements
To run this project, you need a `.env` file (based on `.env.example`) with:
-   `SECRET_KEY`
-   `AWS_ACCESS_KEY_ID`
-   `AWS_SECRET_ACCESS_KEY`
-   `AWS_REGION`
-   `AWS_BUCKET_NAME`
