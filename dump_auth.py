import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def find_node(node, id_):
    if node.get("id") == id_:
        return node
    for child in node.get("children", []):
        res = find_node(child, id_)
        if res: return res
    return None

def rgba_str(c):
    return f"rgba({int(c.get('r',0)*255)}, {int(c.get('g',0)*255)}, {int(c.get('b',0)*255)}, {round(c.get('a',1),2)})"

def dump_node(node, indent=0):
    prefix = "  " * indent
    name = node.get("name", "")
    type_ = node.get("type", "")
    line = f"{prefix}- {name} ({type_})"
    
    # Bounding box
    bbox = node.get("absoluteBoundingBox", {})
    if bbox:
        line += f" [x:{bbox.get('x')} y:{bbox.get('y')} w:{bbox.get('width')} h:{bbox.get('height')}]"
        
    # Text
    if type_ == "TEXT" and "characters" in node:
        line += f" -> TEXT: {repr(node['characters'])}"
        style = node.get("style", {})
        if style:
            font = style.get("fontFamily")
            size = style.get("fontSize")
            line += f" (Font: {font} {size}px)"
            
    # Fills
    fills = node.get("fills", [])
    colors = []
    for fill in fills:
        if fill.get("type") == "SOLID" and "color" in fill:
            colors.append(rgba_str(fill["color"]))
    if colors:
        line += f" Fills: {', '.join(colors)}"
        
    # Strokes
    strokes = node.get("strokes", [])
    stroke_colors = []
    for stroke in strokes:
        if stroke.get("type") == "SOLID" and "color" in stroke:
            stroke_colors.append(rgba_str(stroke["color"]))
    if stroke_colors:
        line += f" Strokes: {', '.join(stroke_colors)} ({node.get('strokeWeight', 1)}px)"

    if "cornerRadius" in node:
        line += f" Radius: {node['cornerRadius']}px"

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
print("--- LOGIN PAGE ---")
login = find_node(doc, "11:2")
if login: dump_node(login)

print("\n--- SIGNUP PAGE ---")
signup = find_node(doc, "22:133")
if signup: dump_node(signup)
