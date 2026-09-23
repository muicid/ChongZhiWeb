"""Regenerate the bundled WOFF2 after editing site text: npm run fonts."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = root / "assets/fonts/LXGWWenKaiLite-Regular.ttf"
target = root / "public/fonts/LXGWWenKaiLite-Regular.woff2"
text = "".join(chr(code) for code in range(32, 127))
for path in sorted((root / "src").rglob("*")):
    if path.suffix in {".ts", ".tsx", ".css"}:
        text += path.read_text(encoding="utf-8")
text += (root / "index.html").read_text(encoding="utf-8")

font = TTFont(source, recalcTimestamp=False)
options = subset.Options()
options.flavor = "woff2"
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor = "woff2"
font.save(target)
print(f"Font: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes")
