# Arpita | AI Developer Portfolio

Angular 20 frontend + Python FastAPI backend. Content lives in JSON files for now and
can be moved to a database (SQLAlchemy) later without touching the API or the UI.

```
portfolio/
├── backend/                FastAPI
│   ├── app/
│   │   ├── main.py         routes, CORS, rate limiting
│   │   ├── storage.py      JsonRepository  (swap for SqlRepository later)
│   │   ├── chatbot.py      retrieval chatbot over your own content
│   │   └── schemas.py      request validation
│   ├── data/               <- EDIT YOUR CONTENT HERE
│   │   ├── profile.json    name, about, skills, experience, publications, socials
│   │   ├── projects.json   projects (add your AI agent details here)
│   │   ├── posts.json      blog posts
│   │   ├── messages.json   contact-form inbox (written by the API)
│   │   └── resume.pdf      (optional) drop your resume here
│   └── tests/test_api.py
└── frontend/               Angular (standalone components, lazy-loaded routes)
    └── src/app/
        ├── core/           api service, scroll-reveal + spotlight directives
        ├── shared/         neural-network background, typewriter, chat widget
        └── pages/          home, projects, project-detail, blog, post, contact
```

## Run it (easiest: Python only, no Node needed)

The website is already built into `backend/web`, and the Python server serves it.
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app
```
Open http://localhost:8000

## Run in development mode (only if you want to edit the frontend)

Needs Node 20.19+ / 22.12+ (Angular 20). Two terminals:
```bash
# Terminal 1
cd backend && python -m uvicorn app.main:app --reload
# Terminal 2
cd frontend && npm install && npm start      # http://localhost:4200
```
After changing the frontend, rebuild the served site:
```bash
cd frontend && npm run build
# then replace backend/web with the contents of frontend/dist/frontend/browser
```

## Make it yours (do these first)

1. `backend/data/profile.json`: replace the GitHub and LinkedIn URLs, check the email, adjust the text.
2. `backend/data/projects.json`: fill in the **ai-agent** entry (description, highlights, github, demo) once the agent is built.
3. Put `resume.pdf` in `backend/data/` so the Resume button works.
4. Replace the sample post in `posts.json` with real writing.

## Tests

```bash
cd backend && pip install -r requirements-dev.txt && python -m pytest
```

## Deploy (free, one service)

The Python server also serves the website, so you deploy **one** thing.

1. Put this folder on GitHub (new public repository, upload the files).
2. On render.com: **New > Blueprint**, pick your repository, click **Apply**.
   Render reads `render.yaml` and builds it. After a few minutes you get a link like
   `https://arpita-portfolio.onrender.com`.
3. Use that link in your resume and applications.

Notes:
- Free Render services go to sleep after ~15 minutes without visitors. The first visit afterwards
  takes about a minute. Before sending applications, open the link yourself to wake it, or use a free
  uptime pinger (for example UptimeRobot) on `/api/health`.
- Contact messages are saved to `messages.json`, but free hosts wipe files on restart. Every message is
  also written to the service **Logs** tab on Render, so check there.
- To change content later: edit the files in `backend/data/`, commit to GitHub, Render redeploys itself.

## Moving to a database later

`storage.py` defines a `Repository` interface. Write a `SqlRepository` with the same methods using SQLAlchemy
(tables: projects, posts, messages) and return it from `get_repo()`. Nothing else changes.

## Upgrading the chatbot later

`chatbot.py` currently does keyword retrieval (BM25) with no installs. To upgrade: replace `retrieve()` with
embeddings plus a vector store, and pass the retrieved chunks to an LLM inside `answer()`.
