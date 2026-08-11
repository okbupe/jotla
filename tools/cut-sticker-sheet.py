"""Cut an already-transparent 21:9 five-face sticker sheet into five square PNGs.

The founder cut the die-cut borders off in Photoshop, which beats any automatic
matte: the alpha channel IS the answer, so this script does no keying at all.
It only splits, sizes and squares the five faces.

Faces are sized by AREA, not by bounding box: a wide short head and a tall
eared head with the same box read as different sizes on screen.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, OUT_DIR = sys.argv[1], sys.argv[2]
NAMES = ["happy", "ok", "sad", "worried", "angry"]
SIZE = 256
ALPHA_ON = 24    # alpha at or below this is background, not faint art
SPECK = 400      # blobs smaller than this are matte crumbs
MIN_GAP = 250    # a split sits at least this far from another split
FILL = 0.96

im = Image.open(SRC).convert("RGBA")
arr = np.array(im)
alpha = arr[:, :, 3]
on = alpha > ALPHA_ON
print(f"{SRC}: {im.size[0]}x{im.size[1]}, {on.sum():,} px of art ({on.mean() * 100:.1f}%)")

lab, n = ndimage.label(on)
sizes = ndimage.sum(on, lab, range(1, n + 1))
on = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= SPECK])
print(f"  blobs {n}, kept {int((sizes >= SPECK).sum())}")

colcount = on.sum(axis=0)
runs, start = [], None
for x, live in enumerate(colcount > 0):
    if live and start is None:
        start = x
    elif not live and start is not None:
        runs.append([start, x]); start = None
if start is not None:
    runs.append([start, len(colcount)])
while len(runs) < len(NAMES):
    s, e = max(runs, key=lambda r: r[1] - r[0])
    inner = colcount[s + MIN_GAP:e - MIN_GAP]
    if len(inner) == 0:
        sys.exit(f"FAIL: {SRC} cannot be split into {len(NAMES)}")
    cut = s + MIN_GAP + int(np.argmin(inner))
    print(f"  two stickers share a column run: split {s}-{e} at x={cut}")
    runs.remove([s, e]); runs += [[s, cut], [cut, e]]; runs.sort()
if len(runs) != len(NAMES):
    sys.exit(f"FAIL: {SRC} gave {len(runs)} faces, not {len(NAMES)}")

boxes = []
for x0, x1 in runs:
    strip = on[:, x0:x1]
    rows = np.where(strip.sum(axis=1) > 0)[0]
    cols = np.where(strip.sum(axis=0) > 0)[0]
    boxes.append((x0 + int(cols[0]), int(rows[0]), x0 + int(cols[-1]) + 1, int(rows[-1]) + 1))

clean = arr.copy()
clean[..., 3] = np.where(on, alpha, 0)
areas = [(b[2] - b[0]) * (b[3] - b[1]) for b in boxes]
caps = [min(SIZE * FILL / (b[2] - b[0]), SIZE * FILL / (b[3] - b[1])) for b in boxes]
target = min(ar * c * c for ar, c in zip(areas, caps))
for (x0, y0, x1, y1), ar, name in zip(boxes, areas, NAMES):
    k = (target / ar) ** 0.5
    w, h = max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))
    face = Image.fromarray(clean[y0:y1, x0:x1], "RGBA").resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(face, ((SIZE - w) // 2, (SIZE - h) // 2))
    canvas.save(f"{OUT_DIR}/{name}.png")
    print(f"  {name:8s} {x1 - x0}x{y1 - y0} -> {w}x{h}")
