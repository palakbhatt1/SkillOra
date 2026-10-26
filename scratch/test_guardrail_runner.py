import sys
import os
import uuid
import urllib.request

sys.path.insert(0, os.path.abspath("backend"))
from app.auth import make_token

token = make_token(1)

def test_file(filename, expected_status):
    path = os.path.join("frontend", "public", filename)
    if not os.path.exists(path):
        print(f"File missing: {path}")
        return
    with open(path, "rb") as f:
        file_bytes = f.read()

    boundary = uuid.uuid4().hex
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode("utf-8"))
    body.extend(b"Content-Type: application/octet-stream\r\n\r\n")
    body.extend(file_bytes)
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/sources/upload",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {token}",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"{filename}: HTTP {resp.status} (Expected {expected_status}) -> PASS")
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")
        match = "PASS" if e.code == expected_status else "FAIL"
        print(f"{filename}: HTTP {e.code} (Expected {expected_status}) -> {match} | Response: {detail[:80]}...")

if __name__ == "__main__":
    print("=== LIVE GUARDRAIL INTERCEPT VERIFICATION ===")
    test_file("sample_subject_lecture.pptx", 422)
    test_file("sample_subject_slides.pdf", 422)
    test_file("adversarial_prompt_injection_resume.pdf", 422)
    test_file("sample_aiml_resume.pdf", 200)
