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
