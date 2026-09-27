# Skillora: setup

Clone, install, run. For architecture and roles, see `docs/skillora-project-document.md` and `docs/team-docs/`.

## 1. Clone

```
git clone <repo-url>
cd SkillOra
```

## 2. Backend

```
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and fill in:

```
GEMINI_API_KEY=your-key-here
DATABASE_URL=sqlite:///./data/skillora.db
DATA_DIR=./data
```

Get a free Gemini key at https://aistudio.google.com/apikey. Never commit `.env` — it's already in `.gitignore`.

Initialize the database:

```
python init_db.py
```

Run the backend:

```
uvicorn app.main:app --reload
```

It's up at `http://localhost:8000`. Check `http://localhost:8000/docs` for the interactive API reference (FastAPI generates this automatically).

## 3. Frontend

New terminal:

```
cd frontend
npm install
cp .env.local.example .env.local     # if it doesn't exist, create it with the line below
```

`.env.local` should contain:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run it:

```
npm run dev
```

It's up at `http://localhost:3000`.

## 4. Verify it's working

- Backend: `http://localhost:8000/docs` loads and lists the routes.
- Frontend: `http://localhost:3000` loads the projects page.
- Run `python test_ingest.py` from `backend/` to sanity-check the ingestion flow if you're working on Profile Builder.

## 5. Before you push anything

```
git status
```

Confirm `.env`, `data/skillora.db`, and `node_modules/` never show up as staged. If one does, stop and fix `.gitignore` before committing.

## 6. Branch and start work

```
git checkout -b feature/<your-feature-name>
```

Branch names and what each person owns: see `docs/team-docs/00-repo-and-team-setup.md`.
