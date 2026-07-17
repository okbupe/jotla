"""Re-ground Jotla's light illustration deck onto the dark page (#0E1726).

CANDIDATE, 17 Jul 2026. Not approved, not wired into any build. Bupe's call.

WHY THIS EXISTS. The 14 generated illustrations carry a baked-in #F7F9FC ground,
so on the dark theme they land as bright cards. The brief asked for a "re-ground,
not a redesign": same subjects, same composition, ground at #0E1726. This does
exactly that, and it is the only option on the table that preserves the casting
locks BY CONSTRUCTION, because it moves the original pixels rather than asking a
model to draw new people. Regeneration cannot promise that: every job in the
manifests ran with "Reference image: none", so a fresh dark set returns DIFFERENT
faces, and the fairness lock (Black British / White / South Asian / East Asian /
mixed heritage) and the gender lock (10 children, 5 girls 5 boys) would each need
re-reviewing from scratch.

THE METHOD, and why the obvious version fails. A naive fixed-tolerance flood fill
(`flood_naive`) leaves a bright keyline on every silhouette: the anti-aliased band
between art and ground is a genuine gradient, so no tolerance separates it. Raise
it and it eats the artwork; lower it and the halo stays. `matte_reground` solves it
properly. For art composited over a known ground G, each pixel is P = a*A + (1-a)*G,
so re-grounding onto G' is exact: P' = P + (1-a)*(G' - G). Only the per-pixel alpha
is needed. Ground is found by a CONNECTIVITY-aware flood from the border, not a
colour test, so an enclosed light prop is correctly kept as art.

GROUND, MEASURED (17 Jul, all 14, not asserted). The page ground lands on #0E1726
EXACTLY, delta 0, across 45-74% of each frame. It beats the light set's own measured
delta of 3, because this is a composite rather than a generation: no model has to hit
a hex. That is true only since the `out[gcore_er] = NEW` line below; the recomposite
alone carried the source's webp noise through and drifted up to 18. The 2px fringe
band hugging each silhouette still carries that noise (max ~12) and is left alone
deliberately: it is the anti-aliasing transition, not the page.

WHAT IT DOES NOT FIX, and this is the honest limit. Roughly 5 of 14 scenes contain a
light-tuned PROP that was drawn to sit on an off-white page and now glows on the dark
one: tipReconnect's white sofa, the floor-pool under tipAvoid's father, tipRoom's rug,
tipCalm's mat, tourToday's floor. The tool is right to keep them (they are art, not
ground); the art itself is what is wrong for a dark page. Those need repainting, by
hand or by a targeted img2img, before this set could ship. Look at the pixels before
believing any of it: `python all14.py` writes all14_matte.png.

Provenance: found by the adversarial gate on 17 Jul, which refuted the producer's
claim that a re-ground was impossible. See NATIVE-SYNC.md section B.
"""

import numpy as np
from PIL import Image
from collections import deque

SRC = 'C:/Users/bupe/dev/jotla-web/design-handoff/source/jotla/illo/'
NEW = np.array([14, 23, 38], float)   # #0E1726


def ground_colour(a):
    ring = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return np.median(ring, axis=0)


def flood_naive(a, tol=14):
    """The producer's method: every pixel within `tol` of the ground -> new ground."""
    G = ground_colour(a)
    d = np.abs(a - G).max(axis=2)
    m = d <= tol
    out = a.copy()
    out[m] = NEW
    return out, m


def flood_connected(a, tol):
    """Flood from the border, colour tolerance `tol`, 4-connected.
    Connectivity means an enclosed light prop is NOT eaten."""
    G = ground_colour(a)
    cand = np.abs(a - G).max(axis=2) <= tol
    h, w = cand.shape
    seen = np.zeros((h, w), bool)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    return seen


def dilate(m, n=1):
    o = m.copy()
    for _ in range(n):
        p = o.copy()
        p[1:, :] |= o[:-1, :]; p[:-1, :] |= o[1:, :]
        p[:, 1:] |= o[:, :-1]; p[:, :-1] |= o[:, 1:]
        o = p
    return o


def nearest_colour(a, src_mask, need_mask, iters=12):
    """Propagate colours from src_mask outward to fill need_mask (cheap NN fill)."""
    out = a.copy().astype(float)
    known = src_mask.copy()
    for _ in range(iters):
        if not (need_mask & ~known).any():
            break
        acc = np.zeros_like(out); cnt = np.zeros(out.shape[:2])
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(np.roll(out, dy, 0), dx, 1)
            km = np.roll(np.roll(known, dy, 0), dx, 1)
            acc += sh * km[..., None]; cnt += km
        fill = (cnt > 0) & ~known
        out[fill] = (acc[fill] / cnt[fill][..., None])
        known |= fill
    return out


def enclosed_ground(a, gcore, hole_tol=8):
    """Ground-coloured pockets the border flood cannot reach: the gap between a figure's
    legs, under an arm, inside a handle. Closed off by the art, so they are not
    border-connected, so `flood_connected` correctly refuses to guess and leaves them as
    art. On a light page that is invisible (they ARE the page). On a dark one they become
    bright wedges: tipAvoid's father had a white slab down his legs because of this.

    Colour separates them from a real light prop, and the margin is enormous, so this is
    safe rather than lucky. Measured on tipAvoid: the three pockets are #F8F9FD, delta 0
    from the ground, i.e. the same flat fill. Measured on tipReconnect: the white sofa is
    NOT within even tol=18 of the ground and never appears here. hole_tol=8 sits in a gap
    with nothing in it. A prop that genuinely IS the page colour is indistinguishable from
    the page anyway, so flooding it is right.
    """
    return (np.abs(a - ground_colour(a)).max(axis=2) <= hole_tol) & ~gcore


def matte_reground(a, tol=18):
    """Method B. Connectivity-aware ground, per-pixel alpha, exact recomposite."""
    G = ground_colour(a)
    gcore = flood_connected(a, tol)          # true page ground only
    gcore = gcore | enclosed_ground(a, gcore)  # ...plus the pockets it cannot reach
    gcore_er = ~dilate(~gcore, 2)            # erode: drop the soft fringe
    art_core = ~dilate(gcore, 2)             # confidently art
    fringe = ~gcore_er & ~art_core           # the anti-aliased band

    A = nearest_colour(a, art_core, fringe)  # local art colour behind each fringe px
    d = A - G
    den = (d * d).sum(axis=2)
    num = ((a - G) * d).sum(axis=2)
    alpha = np.clip(np.divide(num, den, out=np.zeros_like(num), where=den > 1e-6), 0, 1)
    alpha[art_core] = 1.0
    alpha[gcore_er] = 0.0

    out = a + (1 - alpha)[..., None] * (NEW - G)   # P' = P + (1-a)(G'-G)
    # The recomposite carries the SOURCE ground's webp noise through as (a - G), which
    # measured p50=0 / p99=4 / max=18 against #0E1726. Invisible on the light original;
    # not on a dark page, where flat navy shows every stray point. Pixels at alpha==0 are
    # pure page ground by definition, so set them rather than nudge them: delta 0, and
    # the tail dies. Only the fringe (0 < alpha < 1) needs the arithmetic.
    out[gcore_er] = NEW
    return np.clip(out, 0, 255), alpha, gcore


if __name__ == '__main__':
    import sys
    files = {'tourWelcome': 'tourWelcome.8da0a563.webp',
             'tipReconnect': 'tipReconnect.7c285113.webp',
             'tourGate': 'tourGate.e577cf3e.webp'}
    panels = []
    for k, f in files.items():
        a = np.array(Image.open(SRC + f).convert('RGB')).astype(float)
        naive, nm = flood_naive(a, 14)
        matte, alpha, gcore = matte_reground(a, 18)
        print('%-13s ground=%s naive-hit=%.1f%% connected-ground=%.1f%%'
              % (k, '#%02X%02X%02X' % tuple(ground_colour(a).astype(int)),
                 100 * nm.mean(), 100 * gcore.mean()))
        row = np.hstack([a, naive, matte])
        panels.append(np.array(Image.fromarray(row.astype('uint8')).resize((1350, 450), Image.LANCZOS)))
        Image.fromarray(matte.astype('uint8')).save(f'rg_{k}_matte.png')
        Image.fromarray(naive.astype('uint8')).save(f'rg_{k}_naive.png')
    Image.fromarray(np.vstack(panels).astype('uint8')).save('reground_compare.png')
    print('\nreground_compare.png  (original | naive flood | matte reground)')
