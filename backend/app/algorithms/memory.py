"""
Memory Management — Page Replacement Algorithms
Implements: FIFO, LRU, Optimal, LFU, Clock (Second Chance)
Each returns per-step frame states for frame-by-frame animation.
"""
from __future__ import annotations
from collections import OrderedDict, deque
from typing import Optional


def _state(time: int, page: int, frames: list, fault: bool,
           evicted=None, hit_index=None) -> dict:
    return dict(time=time, page=page,
                frames=[f for f in frames],
                fault=fault,
                evicted=evicted,
                hit_index=hit_index)


def _pack(algorithm: str, frames: int, pages: list[int],
          states: list[dict]) -> dict:
    faults = sum(1 for s in states if s["fault"])
    hits   = len(states) - faults
    return dict(algorithm=algorithm, frames=frames, pages=pages,
                states=states, fault_count=faults, hit_count=hits,
                fault_rate=round(faults / len(states) * 100, 2) if states else 0,
                hit_rate=round(hits / len(states) * 100, 2) if states else 0)


# ── 1. FIFO ───────────────────────────────────────────────────────────────────

def fifo(pages: list[int], n_frames: int) -> dict:
    frames  = [None] * n_frames
    order   = deque()          # FIFO eviction order
    states  = []

    for t, page in enumerate(pages):
        if page in frames:
            idx = frames.index(page)
            states.append(_state(t, page, frames, False, hit_index=idx))
        else:
            evicted = None
            if None in frames:
                pos = frames.index(None)
            else:
                evicted_page = order.popleft()
                pos          = frames.index(evicted_page)
                evicted      = evicted_page
            frames[pos] = page
            order.append(page)
            states.append(_state(t, page, frames, True, evicted=evicted))

    return _pack("FIFO", n_frames, pages, states)


# ── 2. LRU ────────────────────────────────────────────────────────────────────

def lru(pages: list[int], n_frames: int) -> dict:
    frames    = [None] * n_frames
    last_used = {}              # page → last access time
    states    = []

    for t, page in enumerate(pages):
        if page in frames:
            idx = frames.index(page)
            last_used[page] = t
            states.append(_state(t, page, frames, False, hit_index=idx))
        else:
            evicted = None
            if None in frames:
                pos = frames.index(None)
            else:
                lru_page = min((p for p in frames if p is not None),
                               key=lambda p: last_used.get(p, -1))
                pos     = frames.index(lru_page)
                evicted = lru_page
                del last_used[lru_page]
            frames[pos] = page
            last_used[page] = t
            states.append(_state(t, page, frames, True, evicted=evicted))

    return _pack("LRU", n_frames, pages, states)


# ── 3. Optimal (OPT / Bélády's) ──────────────────────────────────────────────

def optimal(pages: list[int], n_frames: int) -> dict:
    frames = [None] * n_frames
    states = []

    for t, page in enumerate(pages):
        if page in frames:
            idx = frames.index(page)
            states.append(_state(t, page, frames, False, hit_index=idx))
        else:
            evicted = None
            if None in frames:
                pos = frames.index(None)
            else:
                future = pages[t + 1:]
                def next_use(p):
                    try:    return future.index(p)
                    except: return float("inf")
                victim = max((p for p in frames if p is not None), key=next_use)
                pos     = frames.index(victim)
                evicted = victim
            frames[pos] = page
            states.append(_state(t, page, frames, True, evicted=evicted))

    return _pack("Optimal", n_frames, pages, states)


# ── 4. LFU ────────────────────────────────────────────────────────────────────

def lfu(pages: list[int], n_frames: int) -> dict:
    frames   = [None] * n_frames
    freq     = {}               # page → frequency
    last_use = {}               # page → last access time (for tie-breaking)
    states   = []

    for t, page in enumerate(pages):
        if page in frames:
            idx = frames.index(page)
            freq[page]     = freq.get(page, 0) + 1
            last_use[page] = t
            states.append(_state(t, page, frames, False, hit_index=idx))
        else:
            evicted = None
            freq[page]     = freq.get(page, 0) + 1
            last_use[page] = t
            if None in frames:
                pos = frames.index(None)
            else:
                # Evict least frequently used; tie → evict least recently used
                victim = min((p for p in frames if p is not None),
                             key=lambda p: (freq.get(p, 0), last_use.get(p, 0)))
                pos     = frames.index(victim)
                evicted = victim
                del freq[victim]
                del last_use[victim]
            frames[pos] = page
            states.append(_state(t, page, frames, True, evicted=evicted))

    return _pack("LFU", n_frames, pages, states)


# ── 5. Clock (Second Chance) ──────────────────────────────────────────────────

def clock(pages: list[int], n_frames: int) -> dict:
    frames       = [None] * n_frames
    ref_bits     = [0] * n_frames      # reference bit per frame slot
    hand         = 0                   # clock hand
    states       = []

    for t, page in enumerate(pages):
        if page in frames:
            idx = frames.index(page)
            ref_bits[idx] = 1           # set reference bit on hit
            states.append(_state(t, page, frames, False, hit_index=idx))
        else:
            evicted = None
            if None in frames:
                pos         = frames.index(None)
                frames[pos] = page
                ref_bits[pos] = 1
            else:
                # Clock sweep
                while ref_bits[hand] == 1:
                    ref_bits[hand] = 0
                    hand = (hand + 1) % n_frames
                evicted      = frames[hand]
                frames[hand] = page
                ref_bits[hand] = 1
                hand = (hand + 1) % n_frames
            states.append(_state(t, page, frames, True, evicted=evicted))

    return _pack("Clock", n_frames, pages, states)


# ── Dispatcher ────────────────────────────────────────────────────────────────

def run_memory(algorithm: str, pages: list[int], n_frames: int) -> dict:
    alg = algorithm.lower()
    if   alg == "fifo":    return fifo(pages, n_frames)
    elif alg == "lru":     return lru(pages, n_frames)
    elif alg == "optimal": return optimal(pages, n_frames)
    elif alg == "lfu":     return lfu(pages, n_frames)
    elif alg == "clock":   return clock(pages, n_frames)
    else:
        raise ValueError(f"Unknown memory algorithm: {algorithm}")
