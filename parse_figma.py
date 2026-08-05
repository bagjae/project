import json
import sys
import io

# Fix stdout encoding for powershell
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_texts(node):
    texts = []
    if node.get("type") == "TEXT" and "characters" in node:
        texts.append(node["characters"].replace("\n", " "))
    for child in node.get("children", []):
        texts.extend(extract_texts(child))
    return texts

try:
    with open("figma.json", "r", encoding="utf-8-sig") as f:
        data = json.load(f)
except Exception as e:
    print("Error:", e)
    sys.exit(1)

doc = data.get("document", {})
for canvas in doc.get("children", []):
    print(f"Canvas: {canvas.get('name')}")
    for frame in canvas.get("children", []):
        name = frame.get('name')
        id_ = frame.get('id')
        texts = extract_texts(frame)
        print(f"  Frame: {name} (id: {id_})")
        print(f"    Texts: {', '.join(texts[:10])}")
