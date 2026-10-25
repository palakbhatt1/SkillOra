"""Shared vocabulary: technology list, synonyms (ATS-style normalisation), text helpers."""
import re

# canonical name -> aliases. ATS engines normalise synonyms before keyword matching.
SYNONYMS: dict[str, list[str]] = {
    "python": ["python3", "py"],
    "javascript": ["js", "ecmascript", "es6"],
    "typescript": ["ts"],
    "java": [],
    "c++": ["cpp"],
    "c#": ["csharp", "c sharp"],
    "golang": [],
    "rust": [],
    "sql": ["structured query language"],
    "postgresql": ["postgres", "psql", "pgsql"],
    "mysql": [],
    "mongodb": ["mongo"],
    "sqlite": [],
    "redis": [],
    "react": ["reactjs", "react.js"],
    "next.js": ["nextjs", "next"],
    "node.js": ["nodejs", "node"],
    "express": ["expressjs", "express.js"],
    "django": [],
    "flask": [],
    "fastapi": ["fast api"],
    "spring boot": ["springboot", "spring"],
    "rest api": ["rest", "restful", "rest apis", "restful api", "restful apis", "api development"],
    "graphql": [],
    "docker": ["containerization", "containerisation", "containers", "dockerfile", "docker compose"],
    "kubernetes": ["k8s"],
    "aws": ["amazon web services"],
    "gcp": ["google cloud", "google cloud platform"],
    "azure": ["microsoft azure"],
    "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous deployment", "github actions", "jenkins"],
    "git": ["github", "gitlab", "version control"],
    "linux": ["unix", "bash"],
    "machine learning": ["ml"],
    "deep learning": ["dl", "neural networks"],
    "nlp": ["natural language processing"],
    "computer vision": ["cv", "opencv"],
    "llm": ["llms", "large language model", "large language models", "generative ai", "genai"],
    "rag": ["retrieval augmented generation", "retrieval-augmented generation"],
    "langchain": ["lang chain", "langgraph"],
    "crewai": ["crew ai"],
    "google adk": ["adk", "agent development kit"],
    "multi-agent": ["multi agent", "multiagent", "agentic", "ai agents", "agents"],
    "vector database": ["vector db", "vector databases", "pgvector", "chroma", "faiss", "pinecone", "embeddings"],
    "pytorch": ["torch"],
    "tensorflow": ["tf", "keras"],
    "scikit-learn": ["sklearn", "scikit learn"],
    "pandas": [],
    "numpy": [],
    "sqlalchemy": [],
    "pydantic": [],
    "gemini": ["google gemini"],
    "ollama": [],
    "tailwind": ["tailwindcss", "tailwind css"],
    "html": ["html5"],
    "css": ["css3"],
    "testing": ["pytest", "unit testing", "unit tests", "jest"],
    "evaluation": ["model evaluation", "evaluation set", "benchmarking", "test set"],
    "agile": ["scrum"],
    "data structures": ["dsa", "algorithms"],
    "microservices": ["micro services"],
    "pdf parsing": ["pdfplumber"],
    "api": ["apis"],
}

ALIAS_TO_CANON: dict[str, str] = {}
for canon, aliases in SYNONYMS.items():
    ALIAS_TO_CANON[canon] = canon
    for a in aliases:
        ALIAS_TO_CANON.setdefault(a, canon)

# canonical skills only (the entries ATS engines treat as "hard skills")
HARD_SKILLS = set(SYNONYMS.keys())

DEGREE_RE = re.compile(r"\b(b\.?\s?tech|b\.?\s?e\.?|bachelor|b\.?\s?sc|m\.?\s?tech|master|m\.?\s?sc|mba|ph\.?d|diploma|computer science|engineering degree)\b", re.I)
ACTION_RE = re.compile(
    r"\b(built|build|developed|develop|designed|implemented|created|led|managed|deployed|integrated|authored|"
    r"engineered|optimized|optimised|reduced|improved|increased|achieved|won|interned|automated|trained|"
    r"launched|migrated|analysed|analyzed|wrote|maintained|served|used|using|worked)\b",
    re.I,
)
NUM_RE = re.compile(r"\d+(?:\.\d+)?")
METRIC_RE = re.compile(r"\d+(?:\.\d+)?\s?(%|x\b|k\b|\+|users|ms|seconds|minutes|hours|teams|requests|commits)", re.I)


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#./\- ]", " ", s.lower())).strip()


def _pattern(term: str) -> re.Pattern:
    return re.compile(r"(?<![a-z0-9+#])" + re.escape(term) + r"(?![a-z0-9+#])", re.I)


_PATTERNS = {t: _pattern(t) for t in ALIAS_TO_CANON}


# short/ambiguous aliases that cause false positives ("go", "next", "rest" ...). Only the
# canonical long form is matched for these.
AMBIGUOUS = {"go", "next", "node", "rest", "agents", "py", "spring", "express", "tf", "dl", "cv", "api", "apis", "containers", "mongo"}


def find_skills(text: str) -> set[str]:
    """Canonical hard skills mentioned in text (synonym-aware, word-boundary exact)."""
    found = set()
    for term, pat in _PATTERNS.items():
        if term in AMBIGUOUS and term not in HARD_SKILLS:
            continue
        if pat.search(text):
            found.add(ALIAS_TO_CANON[term])
    # canonical-only ambiguous words: need technical context
    low = text.lower()
    if re.search(r"\bgolang\b|\bgo (?:language|developer|programming)\b", low):
        found.add("golang")
    return found


DISPLAY = {
    "postgresql": "PostgreSQL", "fastapi": "FastAPI", "llm": "LLMs", "rag": "RAG", "ci/cd": "CI/CD", "rest api": "REST APIs",
    "langchain": "LangChain", "crewai": "CrewAI", "google adk": "Google ADK", "vector database": "Vector databases",
    "multi-agent": "Multi-agent systems", "nlp": "NLP", "aws": "AWS", "gcp": "GCP", "sql": "SQL", "javascript": "JavaScript",
    "typescript": "TypeScript", "next.js": "Next.js", "node.js": "Node.js", "sqlalchemy": "SQLAlchemy", "mongodb": "MongoDB",
    "pytorch": "PyTorch", "tensorflow": "TensorFlow", "scikit-learn": "scikit-learn", "graphql": "GraphQL", "html": "HTML",
    "css": "CSS", "mysql": "MySQL", "sqlite": "SQLite", "numpy": "NumPy", "pydantic": "Pydantic", "ollama": "Ollama",
    "machine learning": "Machine learning", "deep learning": "Deep learning", "computer vision": "Computer vision",
    "data structures": "Data structures", "pdf parsing": "PDF parsing", "api": "APIs", "golang": "Go", "c++": "C++", "c#": "C#",
}


def pretty(skill: str) -> str:
    return DISPLAY.get(skill, skill.capitalize())
