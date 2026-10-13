import io
from typing import List, Dict, Any, Union
from pypdf import PdfReader

class PDFParser:
    """Parses PDF documents into text chunks with page numbers and exact quotes."""

    @staticmethod
    def parse(file_or_path: Union[str, bytes], filename: str = "document.pdf") -> List[Dict[str, Any]]:
        chunks = []
        try:
            if isinstance(file_or_path, bytes):
                reader = PdfReader(io.BytesIO(file_or_path))
            else:
                reader = PdfReader(file_or_path)

            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text()
                if not text:
                    continue
                paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
                for para in paragraphs:
                    chunks.append({
                        "source_file": f"{filename} (page {page_idx + 1})",
                        "content": para,
                        "span": para[:120] + ("..." if len(para) > 120 else "")
                    })
        except Exception as e:
            chunks.append({
                "source_file": filename,
                "content": f"Error parsing PDF: {str(e)}",
                "span": "Error reading PDF file"
            })
        return chunks
