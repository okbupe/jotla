"""Per-scene prop repair for the dark re-ground. Companion to reground.py.

WHY THIS IS A HAND-KEYED LIST AND NOT A RULE. The re-ground is right to keep light
props as art, but some of that art was drawn to sit on an off-white page and glows on a
dark one. A blanket "recolour every bright neutral surface" rule CANNOT work, because
the same test matches three different things:

  - a SURFACE (sofa, rug, mat, floor): drawn light because the page was light. Wrong on
    a dark page. Recolour it to the app's dark surface tones.
  - a LIGHT SOURCE (phone screen, lamp): bright because it EMITS. Correct on a dark page,
    and darkening it would render an off phone. Leave it.
  - a UI CARD (tourPattern's calendar, tourLog's note card): the app's own surface. It is
    a judgement call which way these go, and they currently read as deliberate lit cards.
    Leave them until Bupe says otherwise.

Only a human eye separates those, so each entry below was rendered and looked at. An
empty entry means "verified, nothing to do", which is a finding, not an omission.
"""
import numpy as np
from PIL import Image
from scipy import ndimage
import reground as R

# App dark-surface tones (src/theme.ts darkPalette): card #182338, card2 #1F2C44.
# A touch above card2 at the top so a lit surface still reads as an object, not a hole.
SURFACE_LO = np.array([0x1C, 0x28, 0x3E], float)
SURFACE_HI = np.array([0x3A, 0x4E, 0x74], float)

# scene -> (chroma_max, min_component_fraction). Absent = nothing to repair.
REPAIR = {
    'tipReconnect': (28, 0.003),   # the white sofa: the brightest mass in frame, clearly wrong
}
# Verified by render on 17 Jul and deliberately NOT repaired:
#   tipAvoid     - the white wedge/floor-pool was enclosed PAGE GROUND, not art. Fixed at
#                  source by reground.enclosed_ground(); no prop work needed.
#   tourPattern  - 16.9% bright is the calendar + chart UI cards. Read as intentional.
#   tourChild    - the glow is the phone screen. It emits.
#   tipRoom      - the glow is the lamp and the floor it lights. Justified by the lamp.
#   tourWelcome  - the cream notebook is the hero object, "empty and waiting to be filled".
#                  Reads as a lit page. Darkening it kills the subject.
#   tipCalm      - the mat is warm (chroma > 28), mild, and reads as a lit floor.
#   tourToday    - same: pale floor and sofa read as a dimly lit room.


def _lum(a):
    x = a / 255.0
    x = np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
    return 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]


def surface_mask(m, alpha, chroma_max=28, min_frac=0.003):
    """Bright, NEUTRAL, and art. Chroma is what protects skin: skin carries chroma
    (#F5C9A0 -> 85), a cream sofa does not (~6). Verified against a magenta overlay on
    all five candidates: it never touched a face, an eye or a tooth."""
    L = _lum(m)
    chroma = m.max(axis=2) - m.min(axis=2)
    sm = (alpha > 0.5) & (L > 0.5) & (chroma < chroma_max)
    lab, n = ndimage.label(sm)
    keep = np.zeros_like(sm)
    tot = sm.size
    for i in range(1, n + 1):
        c = lab == i
        if c.sum() / tot > min_frac:     # size filter: drops eye whites and teeth
            keep |= c
    return keep


def repair(scene, m, alpha):
    """Remap a light surface's OWN luminance range onto the dark-card range, so its
    internal shading (and therefore its form) survives the move."""
    if scene not in REPAIR:
        return m, 0.0
    chroma_max, min_frac = REPAIR[scene]
    keep = surface_mask(m, alpha, chroma_max, min_frac)
    if not keep.any():
        return m, 0.0
    L = _lum(m)
    lo, hi = np.percentile(L[keep], 2), np.percentile(L[keep], 98)
    t = np.clip((L - lo) / max(hi - lo, 1e-6), 0, 1)[..., None]
    out = m.copy()
    out[keep] = (SURFACE_LO + (SURFACE_HI - SURFACE_LO) * t)[keep]
    return out, float(keep.mean())
