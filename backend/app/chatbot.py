"""Portfolio assistant: a small retrieval-based chatbot over your own content.

How it works (RAG in miniature, no extra installs):
  1. Turn profile / projects / posts into small text chunks.
  2. Score chunks against the question with a BM25-style keyword ranking.
  3. Answer from the best chunks and cite where they came from.

To upgrade later: replace `retrieve()` with embeddings + a vector store, and pass the retrieved
chunks to an LLM inside `answer()`.
"""
import math
import re
from collections import Counter

from .storage import Repository

STOPWORDS = set(
    "a an and are as at be by can do does for from has have how i in is it me of on or "
    "she her he his tell about what which who why with you your the to this that".split()
)


def _tokens(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9+#.]+", text.lower()) if t not in STOPWORDS and len(t) > 1]


def build_chunks(repo: Repository) -> list[dict]:
    p = repo.get_profile()
    chunks: list[dict] = []

    def add(source: str, text: str) -> None:
        chunks.append({"source": source, "text": text, "tokens": _tokens(text)})

    add("About", f"{p['name']} is an {p['title']} based in {p['location']}. {p['tagline']}")
    for para in p["about"]:
        add("About", para)
    add("Skills", "Skills and tech stack. " + ". ".join(f"{g['group']}: " + ", ".join(g["items"]) for g in p["skills"]) + ".")
    for e in p["experience"]:
        add("Experience", f"{e['role']} at {e['company']} ({e['period']}). " + " ".join(e["points"]))
    for e in p["education"]:
        add("Education", f"{e['degree']}. {e['detail']}")
    for pub in p["publications"]:
        add("Publications", f"Paper: {pub['title']}. {pub['summary']}")
    for pr in repo.list_projects():
        add(
            f"Project: {pr['title']}",
            f"{pr['title']}: {pr['summary']} {pr['description']} Tech: {', '.join(pr['tags'])}. "
            + (("Highlights: " + "; ".join(pr["highlights"]) + ".") if pr["highlights"] else ""),
        )
    for post in repo.list_posts():
        add(f"Blog: {post['title']}", f"{post['title']}. {post['excerpt']}")
    add("Contact", f"You can reach {p['name']} by email at {p['email']} or via the contact form on this site.")
    return chunks


def retrieve(question: str, chunks: list[dict], k: int = 2) -> list[tuple[float, dict]]:
    q = _tokens(question)
    if not q:
        return []
    n = len(chunks)
    avg = sum(len(c["tokens"]) for c in chunks) / max(n, 1)
    df = Counter(t for c in chunks for t in set(c["tokens"]))
    scored = []
    for c in chunks:
        tf = Counter(c["tokens"])
        score = 0.0
        for t in q:
            if t not in tf:
                continue
            idf = math.log(1 + (n - df[t] + 0.5) / (df[t] + 0.5))
            freq = tf[t]
            score += idf * (freq * 2.2) / (freq + 1.2 * (0.25 + 0.75 * len(c["tokens"]) / avg))
        if c["source"].startswith("Blog"):
            score *= 0.5  # profile facts should outrank blog posts for general questions
        if score > 0:
            scored.append((score, c))
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:k]


GREETINGS = {"hi", "hello", "hey", "hii", "hola", "namaste"}


def answer(question: str, repo: Repository) -> dict:
    words = set(re.findall(r"[a-z]+", question.lower()))
    if words & GREETINGS and len(words) <= 3:
        name = repo.get_profile()["name"]
        return {
            "answer": f"Hi! I'm {name}'s portfolio assistant. Ask me about her projects, skills, research or how to get in touch.",
            "sources": [],
        }
    hits = retrieve(question, build_chunks(repo))
    if not hits:
        return {
            "answer": "I couldn't find that in the portfolio. Try asking about projects, skills, experience, research or contact details.",
            "sources": [],
        }
    best = hits[0][0]
    # Keep the top match; add the runner-up only if it is almost as relevant.
    chosen = [c for s, c in hits if s >= 0.75 * best]
    text = _trim(" ".join(c["text"] for c in chosen))
    return {"answer": text, "sources": list(dict.fromkeys(c["source"] for c in chosen))}


def _trim(text: str, limit: int = 380) -> str:
    """Shorten to roughly `limit` characters, ending on a full sentence."""
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind(". "), cut.rfind("; "))
    return (cut[: end + 1] if end > 120 else cut.rstrip() + "…")
