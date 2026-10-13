import hashlib
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import Project, Source, Fact
from app.parsers.github import GitHubParser
from app.parsers.notes import NotesParser
from app.parsers.pdf import PDFParser
from app.parsers.docx import DocxParser
from app.parsers.pptx import PptxParser
from app.parsers.code_folder import CodeFolderParser
from app.agents.crew.ingest_flow import run_extraction_flow, prefill_project_card, ExtractedFact

class IngestService:
    """
    Ingestion orchestrator:
    - Parses various source types
    - Extracts deterministic facts without LLM (requirements.txt, package.json)
    - Extracts atomic facts with quoted spans via CrewAI / Gemini
    - Implements content hash caching and stale fact marking on re-sync
    - Pre-fills the Project Card
    """

    @staticmethod
    def calculate_hash(content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @classmethod
    def ingest_project(cls, db: Session, project_id: int) -> Dict[str, Any]:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"error": f"Project {project_id} not found", "facts_count": 0}

        sources = db.query(Source).filter(Source.project_id == project_id).all()
        if not sources:
            return {"message": "No sources attached to project", "facts_count": 0}

        all_extracted_facts: List[ExtractedFact] = []
        all_chunks: List[Dict[str, Any]] = []
        new_facts_count = 0

        for source in sources:
            source_content = source.raw_text or source.url_or_name or ""
            current_hash = cls.calculate_hash(source_content)

            # Check if source content changed
            source_changed = (source.content_hash != current_hash)
            if source.content_hash and source_changed:
                # Mark existing facts from this source as stale (Requirement 5)
                db.query(Fact).filter(
                    Fact.project_id == project_id,
                    Fact.source_file.like(f"%{source.url_or_name}%")
                ).update({"status": "stale"}, synchronize_session=False)

            # If unchanged and we already have facts, skip re-extracting (Requirement 4: Caching)
            existing_facts = db.query(Fact).filter(
                Fact.project_id == project_id,
                Fact.source_file.like(f"%{source.url_or_name}%"),
                Fact.status != "stale"
            ).all()

            if not source_changed and existing_facts:
                print(f"[IngestService] Cache hit for source {source.url_or_name}. Skipping re-extraction.")
                continue

            # Update hash
            source.content_hash = current_hash

            parsed_chunks: List[Dict[str, Any]] = []
            deterministic_facts: List[Dict[str, Any]] = []

            # Execute appropriate parser based on source type
            if source.type == "github":
                res = GitHubParser.parse(source.url_or_name)
                deterministic_facts = res.get("deterministic_facts", [])
                parsed_chunks = res.get("text_chunks", [])
                if res.get("raw_text") and not source.raw_text:
                    source.raw_text = res.get("raw_text")

            elif source.type == "notes":
                parsed_chunks = NotesParser.parse(source.raw_text or "", source.url_or_name)

            elif source.type == "pdf":
                # If raw_text is available or file bytes
                parsed_chunks = NotesParser.parse(source.raw_text or "", source.url_or_name)

            elif source.type == "docx":
                parsed_chunks = NotesParser.parse(source.raw_text or "", source.url_or_name)

            elif source.type == "pptx":
                parsed_chunks = NotesParser.parse(source.raw_text or "", source.url_or_name)

            elif source.type == "code":
                res = CodeFolderParser.parse(source.url_or_name)
                deterministic_facts = res.get("deterministic_facts", [])
                parsed_chunks = res.get("text_chunks", [])

            else:
                # Fallback to plain notes parser
                parsed_chunks = NotesParser.parse(source_content, source.url_or_name)

            all_chunks.extend(parsed_chunks)

            # 1. Insert deterministic tech facts (from dependency files)
            for df in deterministic_facts:
                existing = db.query(Fact).filter(
                    Fact.project_id == project_id,
                    Fact.claim == df["claim"],
                    Fact.source_span == df["source_span"]
                ).first()
                if not existing:
                    new_fact = Fact(
                        project_id=project_id,
                        fact_type=df["fact_type"],
                        claim=df["claim"],
                        source_span=df["source_span"],
                        source_file=df["source_file"],
                        status="pending"
                    )
                    db.add(new_fact)
                    new_facts_count += 1
                    all_extracted_facts.append(ExtractedFact(
                        fact_type=df["fact_type"],
                        claim=df["claim"],
                        source_span=df["source_span"],
                        source_file=df["source_file"]
                    ))

            # 2. Run LLM / Agent extraction flow on text chunks
            if parsed_chunks:
                agent_facts = run_extraction_flow(parsed_chunks, source_name=source.url_or_name)
                for af in agent_facts:
                    existing = db.query(Fact).filter(
                        Fact.project_id == project_id,
                        Fact.claim == af.claim
                    ).first()
                    if not existing:
                        new_fact = Fact(
                            project_id=project_id,
                            fact_type=af.fact_type,
                            claim=af.claim,
                            source_span=af.source_span,
                            source_file=af.source_file,
                            status="pending"
                        )
                        db.add(new_fact)
                        new_facts_count += 1
                        all_extracted_facts.append(af)

        # 3. Pre-fill project card if project title or summary is empty or default
        if all_extracted_facts or all_chunks:
            # Detect real GitHub repository name from project sources
            github_source = db.query(Source).filter(Source.project_id == project_id, Source.type == "github").first()
            detected_repo_name = None
            if github_source and github_source.url_or_name:
                from app.parsers.github import GitHubParser
                _, r_name = GitHubParser.parse_repo_url(github_source.url_or_name)
                if r_name:
                    detected_repo_name = r_name

            card_info = prefill_project_card(
                all_extracted_facts,
                all_chunks,
                repo_name=detected_repo_name
            )
            if card_info.get("title") and card_info["title"] != "Project Workspace":
                project.title = card_info["title"]
            elif detected_repo_name and (not project.title or project.title in ("SkillOra ATS", "SkillOra Demo", "My Career Project")):
                project.title = detected_repo_name

            if card_info.get("summary"):
                project.summary = card_info["summary"]
            if card_info.get("tech_stack"):
                project.tech_stack = card_info["tech_stack"]
            if card_info.get("role"):
                project.role = card_info["role"]

        db.commit()
        db.refresh(project)

        total_facts = db.query(Fact).filter(Fact.project_id == project_id).count()
        return {
            "status": "success",
            "project_id": project_id,
            "new_facts_added": new_facts_count,
            "total_facts": total_facts,
            "card": {
                "title": project.title,
                "summary": project.summary,
                "tech_stack": project.tech_stack,
                "role": project.role
            }
        }
