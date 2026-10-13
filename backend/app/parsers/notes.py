from typing import List, Dict, Any

class NotesParser:
    """Parses candidate raw text notes into structured chunks with exact quotes."""

    @staticmethod
    def parse(raw_text: str, filename: str = "notes.txt") -> List[Dict[str, Any]]:
        chunks = []
        if not raw_text or not raw_text.strip():
            return chunks

        # Split into meaningful paragraphs or bullet points
        lines = [line.strip() for line in raw_text.strip().split("\n")]
        current_chunk = []
        
        for line in lines:
            if not line:
                if current_chunk:
                    text_chunk = " ".join(current_chunk)
                    chunks.append({
                        "source_file": filename,
                        "content": text_chunk,
                        "span": text_chunk[:100] + ("..." if len(text_chunk) > 100 else "")
                    })
                    current_chunk = []
            else:
                current_chunk.append(line)
                
        if current_chunk:
            text_chunk = " ".join(current_chunk)
            chunks.append({
                "source_file": filename,
                "content": text_chunk,
                "span": text_chunk[:100] + ("..." if len(text_chunk) > 100 else "")
            })
            
        return chunks
