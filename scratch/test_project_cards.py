import sqlite3
import re

con = sqlite3.connect('backend/skillora.db')
cur = con.cursor()

facts = cur.execute('SELECT id, kind, category, project, text, status, source_id FROM fact').fetchall()
sources = dict(cur.execute('SELECT id, name FROM source').fetchall())

def clean_project_name(f_project, f_source_id, f_category):
    src_name = sources.get(f_source_id, '')
    if 'github' in src_name.lower() or '/' in src_name:
        parts = src_name.split('/')
        repo = parts[-1]
        # Clean common repo suffixes
        if 'AntiSoch' in repo: return 'AntiSoch'
        if 'LogicLens' in repo: return 'LogicLens'
        if 'SkillOra' in repo: return 'SkillOra'
        if 'DejaQ' in repo: return 'DejaQ'
        if 'ClaimXplain' in repo: return 'ClaimXplain'
        if 'PersonaPath' in repo: return 'PersonaPath'
        if 'AegisAI' in repo: return 'AegisAI'
        if 'PathWise' in repo: return 'PathWise'
        if 'TransitOps' in repo: return 'TransitOps'
        if 'AbleCircle' in repo: return 'AbleCircle'
        if 'indic-asr' in repo: return 'Indic-ASR-Benchmark'
        if 'hunch' in repo: return 'Hunch'
        if 'cjp' in repo: return 'CJP Discourse Analysis'
        return repo
    if f_category == 'education':
        return 'Education'
    if f_category == 'skill' and (not f_project or f_project == 'Skills'):
        return 'Skills'
    if f_project and f_project not in ('General', 'Skills', 'Education'):
        return f_project
    return 'General'

projects = {}
for f in facts:
    fid, f_kind, f_cat, f_proj, f_text, f_stat, f_src_id = f
    proj = clean_project_name(f_proj, f_src_id, f_cat)
    if proj not in projects:
        projects[proj] = {'description': [], 'features': [], 'results': [], 'skills': []}
    
    # Classify into 4 sections
    is_metric = f_cat == 'metric' or bool(re.search(r'\d+%|\bms\b|\bsec\b|\bseconds\b|\d+ users|\d+ reports|\baccuracy\b|\blatency\b|\buptime\b', f_text, re.I))
    is_skill = f_cat == 'skill'
    is_desc = 'is an ' in f_text.lower() or 'is a ' in f_text.lower() or 'platform empowering' in f_text.lower()

    if is_skill:
        projects[proj]['skills'].append(f_text)
    elif is_metric:
        projects[proj]['results'].append(f_text)
    elif is_desc and not projects[proj]['description']:
        projects[proj]['description'].append(f_text)
    else:
        projects[proj]['features'].append(f_text)

print(f"Total projects found: {len(projects)}")
for p, data in list(projects.items())[:6]:
    print(f"\n=== Project: {p} ===")
    print(f"  Description ({len(data['description'])}):", data['description'][:1])
    print(f"  Features ({len(data['features'])}):", len(data['features']))
    print(f"  Results ({len(data['results'])}):", len(data['results']))
    print(f"  Skills ({len(data['skills'])}):", len(data['skills']))
