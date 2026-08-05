import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def find_frames_by_name(node, names, results):
    if node.get("name") in names:
        results.append(node)
    for child in node.get("children", []):
        find_frames_by_name(child, names, results)

def dump_node(node, indent=0):
    prefix = "  " * indent
    name = node.get("name", "")
    type_ = node.get("type", "")
    line = f"{prefix}- {name} ({type_})"
    
    bbox = node.get("absoluteBoundingBox", {})
    if bbox:
        line += f" [x:{bbox.get('x')} y:{bbox.get('y')} w:{bbox.get('width')} h:{bbox.get('height')}]"
        
    if type_ == "TEXT" and "characters" in node:
        line += f" -> TEXT: {repr(node['characters'])}"
        
    print(line)
    for child in node.get("children", []):
        dump_node(child, indent + 1)

try:
    with open("figma.json", "r", encoding="utf-8-sig") as f:
        data = json.load(f)
except Exception as e:
    print("Error:", e)
    sys.exit(1)

doc = data.get("document", {})
targets = []
find_frames_by_name(doc, ["Frame 20", "Frame 21"], targets)

for t in targets:
    print(f"\n--- {t.get('name')} ---")
    dump_node(t)
