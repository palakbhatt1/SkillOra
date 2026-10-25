"""Resume export: PDF (fpdf2) and DOCX (python-docx). Only verified bullets are exported."""
import io
from itertools import groupby

_MAP = {"–": "-", "—": "-", "‘": "'", "’": "'", "“": '"', "”": '"', "•": "-", "→": "->", "…": "..."}


def _latin(s: str) -> str:
    for k, v in _MAP.items():
        s = s.replace(k, v)
    return s.encode("latin-1", "replace").decode("latin-1")


def _edu(line: str) -> tuple[str | None, str]:
    """'Degree | College | Years' -> ('College - Years', 'Degree'); anything else is printed as-is."""
    parts = [x.strip() for x in line.split(" | ")]
    return (f"{parts[1]} - {parts[2]}", parts[0]) if len(parts) == 3 else (None, line)


def _sections(view: dict, facts: list[dict], profile: dict | None = None) -> dict:
    bullets = [b for b in view["resume"]["bullets"] if b["verified"] or b.get("user")]  # user-written lines are the author's choice

    def group(kind: str):
        sel = [b for b in bullets if (b.get("kind") or "project") == kind]
        out: dict[str, list[str]] = {}
        for b in sel:  # bullets arrive most-relevant-first, so keep first-appearance order (not alphabetical)
            out.setdefault(b["project"], []).append(b["text"])
        return list(out.items())

    experience, projects = group("role"), group("project")
    # the user-confirmed education line (degree, college, years) wins; otherwise the original quoted line, not the reworded fact
    edu = [profile["education"]] if profile and profile.get("education") else [f["span"] or f["text"] for f in facts if f["category"] == "education" and f["status"] == "verified"]
    skills = list(view["resume"].get("skills", []))
    return {"summary": view["resume"]["summary"], "experience": experience, "projects": projects, "education": edu, "skills": skills}


def to_pdf(profile: dict, view: dict, facts: list[dict]) -> bytes:
    from fpdf import FPDF

    sec = _sections(view, facts, profile)
    pdf = FPDF(format="A4")
    pdf.set_margins(18, 16, 18)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 9, _latin(profile["name"]), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 5, _latin(" | ".join(x for x in [profile["email"], profile["links"], profile["location"]] if x)), new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)

    def head(t: str):
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 10.5)
        pdf.cell(0, 6, t.upper(), new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(30, 30, 30)
        pdf.line(pdf.l_margin, pdf.get_y(), 210 - pdf.r_margin, pdf.get_y())
        pdf.ln(1.5)
        pdf.set_font("Helvetica", "", 10)

    head("Summary")
    pdf.multi_cell(0, 5, _latin(sec["summary"]), new_x="LMARGIN", new_y="NEXT")
    if sec["skills"]:
        head("Skills")
        pdf.multi_cell(0, 5, _latin(", ".join(sec["skills"])), new_x="LMARGIN", new_y="NEXT")
    for title, groups in (("Professional Experience", sec["experience"]), ("Projects", sec["projects"])):
        if not groups:
            continue
        head(title)
        for name, items in groups:
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(0, 6, _latin(name), new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 10)
            for t in items:
                pdf.set_x(pdf.l_margin + 3)
                pdf.multi_cell(0, 5, _latin("- " + t), new_x="LMARGIN", new_y="NEXT")
    if sec["education"]:
        head("Education")
        for e in sec["education"]:
            top, degree = _edu(e)
            if top:
                pdf.set_font("Helvetica", "B", 10)
                pdf.cell(0, 5, _latin(top), new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(0, 5, _latin(degree), new_x="LMARGIN", new_y="NEXT")
    return bytes(pdf.output())


def to_docx(profile: dict, view: dict, facts: list[dict]) -> bytes:
    import docx
    from docx.shared import Pt

    sec = _sections(view, facts, profile)
    d = docx.Document()
    d.styles["Normal"].font.name = "Calibri"
    d.styles["Normal"].font.size = Pt(10.5)
    d.add_heading(profile["name"], 0)
    d.add_paragraph(" | ".join(x for x in [profile["email"], profile["links"], profile["location"]] if x))
    d.add_heading("Summary", 2)
    d.add_paragraph(sec["summary"])
    if sec["skills"]:
        d.add_heading("Skills", 2)
        d.add_paragraph(", ".join(sec["skills"]))
    for title, groups in (("Professional Experience", sec["experience"]), ("Projects", sec["projects"])):
        if not groups:
            continue
        d.add_heading(title, 2)
        for name, items in groups:
            p = d.add_paragraph()
            p.add_run(name).bold = True
            for t in items:
                d.add_paragraph(t, style="List Bullet")
    if sec["education"]:
        d.add_heading("Education", 2)
        for e in sec["education"]:
            top, degree = _edu(e)
            if top:
                d.add_paragraph().add_run(top).bold = True
            d.add_paragraph(degree)
    buf = io.BytesIO()
    d.save(buf)
    return buf.getvalue()
