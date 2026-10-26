import sqlite3
import re

con = sqlite3.connect('backend/skillora.db')
cur = con.cursor()

facts = cur.execute('SELECT id, user_id, seq, source_id, text, span, project, category, status, declared, auto, kind FROM fact').fetchall()
sources = cur.execute('SELECT id, name, type FROM source').fetchall()
src_map = {s[0]: {'name': s[1], 'type': s[2]} for s in sources}

def get_canonical_name(proj, src_id, cat):
    if cat == 'education': return None
    s = src_map.get(src_id)
    p = (proj or '').strip()
    if s and (s['type'] == 'github' or '/' in s['name']):
        repo = s['name'].split('/')[-1]
        p = repo
    if not p or p.lower() in ('general', 'skills', 'education') or p.startswith(('1.', '2.', '3.', '###')) or 'pipeline' in p.lower() or 'stack' in p.lower() or 'architecture' in p.lower():
        if s and s['name']:
            p = s['name'].split('/')[-1]
        else:
            return None
    # Clean display name
    clean = re.sub(r'(-App|-System|-Platform)$', '', p, flags=re.I).replace('-', ' ').strip()
    return clean

proj_map = {}
for f in facts:
    fid, uid, seq, src_id, text, span, proj, cat, stat, decl, auto, kind = f
    c_name = get_canonical_name(proj, src_id, cat)
    if not c_name:
        continue
    if c_name not in proj_map:
        proj_map[c_name] = []
    proj_map[c_name].append({
        'id': f"F{seq}", 'text': text, 'cat': cat, 'stat': stat
    })

print(f"Total Canonical Project Cards: {len(proj_map)}\n")
for name, p_facts in list(proj_map.items()):
    desc = [f for f in p_facts if f['cat'] == 'experience' and (' is an ' in f['text'].lower() or ' is a ' in f['text'].lower() or 'platform empowering' in f['text'].lower() or 'system that' in f['text'].lower())]
    desc_f = desc[0] if desc else ([f for f in p_facts if f['cat'] == 'experience'] or [None])[0]
    
    results = [f for f in p_facts if f != desc_f and (f['cat'] == 'metric' or re.search(r'\d+%|\bms\b|\bsec\b|\bseconds\b|\d+ users|\d+ reports|\baccuracy\b|\blatency\b|\buptime\b|\bthroughput\b|\bprecision\b|\brecall\b', f['text'], re.I))]
    tech = [f for f in p_facts if f['cat'] == 'skill']
    used = set([f['id'] for f in ([desc_f] if desc_f else []) + results + tech])
    features = [f for f in p_facts if f['id'] not in used]

    verified = sum(1 for f in p_facts if f['stat'] == 'verified')
    status = "Verified" if verified == len(p_facts) else f"{verified}/{len(p_facts)} Verified"

    print(f"[{status}] Card: {name}")
    print(f"   Description: {desc_f['text'][:70] + '...' if desc_f else 'None'}")
    print(f"   Features: {len(features)} bullets")
    print(f"   Results: {len(results)} metrics")
    print(f"   Tech Stack: {len(tech)} technologies")
    print()
