# CRYPTOVA Backend

FastAPI backend for CRYPTOVA. The React application lives in `../Frontend`.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs are available at `http://127.0.0.1:8000/docs`.

## Supabase database

The backend uses SQLAlchemy against Supabase's managed Postgres database. Set
`SUPABASE_DB_URL` in `.env` to the connection string shown in Supabase under
**Project Settings > Database > Connection string**. Prefer the transaction
pooler connection string for server deployments and keep `sslmode=require`.

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are used for Supabase Auth. Keep
`SUPABASE_SERVICE_KEY` server-side only; it is not required by the application
authentication flow. These values are not a Postgres connection string.
The backend will use `SUPABASE_DB_URL` when present and will otherwise fall
back to `CRYPTOVA_DATABASE_URL` (SQLite by default for local development).

Run `migrations/001_initial_schema.sql` once in the Supabase SQL Editor before
starting the API against Supabase. The application imports the existing
SQLAlchemy models and creates any missing tables on startup.

The frontend uses the backend Supabase Auth endpoints. Access tokens are kept
in the browser only for the current session and sent as bearer tokens to the
backend.

## Security boundary

Supabase access tokens are validated by the backend through Supabase Auth. File
encryption keys are generated and managed by the backend; they are never
returned to the browser.
