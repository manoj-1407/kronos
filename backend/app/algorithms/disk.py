"""
Disk Scheduling Algorithms
Implements: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK
Returns seek sequence, total seek distance, and per-step log for animation.
"""
from __future__ import annotations


def _pack(algorithm: str, initial_head: int, sequence: list[int],
          steps: list[dict], disk_size: int) -> dict:
    total = sum(abs(sequence[i] - sequence[i-1]) for i in range(1, len(sequence)))
    n_req = len(sequence) - 1  # exclude initial head
    return dict(algorithm=algorithm, initial_head=initial_head,
                seek_sequence=sequence, total_seek_distance=total,
                avg_seek_time=round(total / n_req, 2) if n_req > 0 else 0,
                steps=steps, disk_size=disk_size)


# ── 1. FCFS ───────────────────────────────────────────────────────────────────

def disk_fcfs(requests: list[int], head: int, disk_size: int = 200) -> dict:
    sequence = [head] + requests
    steps    = [{"from": sequence[i], "to": sequence[i+1],
                 "distance": abs(sequence[i+1] - sequence[i]),
                 "desc": f"Serve {sequence[i+1]} (FCFS order)"}
                for i in range(len(sequence)-1)]
    return _pack("FCFS", head, sequence, steps, disk_size)


# ── 2. SSTF ───────────────────────────────────────────────────────────────────

def disk_sstf(requests: list[int], head: int, disk_size: int = 200) -> dict:
    remaining = list(requests)
    current   = head
    sequence  = [head]
    steps     = []

    while remaining:
        closest = min(remaining, key=lambda r: abs(r - current))
        dist    = abs(closest - current)
        steps.append({"from": current, "to": closest, "distance": dist,
                      "desc": f"Shortest seek: {closest} (dist={dist})"})
        sequence.append(closest)
        remaining.remove(closest)
        current = closest

    return _pack("SSTF", head, sequence, steps, disk_size)


# ── 3. SCAN ───────────────────────────────────────────────────────────────────

def disk_scan(requests: list[int], head: int, disk_size: int = 200,
              direction: str = "right") -> dict:
    left  = sorted([r for r in requests if r < head], reverse=True)
    right = sorted([r for r in requests if r >= head])
    current  = head
    sequence = [head]
    steps    = []

    def move(targets, label):
        nonlocal current
        for t in targets:
            dist = abs(t - current)
            steps.append({"from": current, "to": t, "distance": dist,
                          "desc": f"SCAN {label}: serving {t}"})
            sequence.append(t)
            current = t

    if direction == "right":
        move(right, "→")
        if left:
            # Go to end of disk
            if current < disk_size - 1:
                steps.append({"from": current, "to": disk_size - 1,
                              "distance": disk_size - 1 - current,
                              "desc": f"SCAN: reaching disk end ({disk_size-1})"})
                sequence.append(disk_size - 1)
                current = disk_size - 1
            move(left, "←")
    else:
        move(left, "←")
        if right:
            if current > 0:
                steps.append({"from": current, "to": 0, "distance": current,
                              "desc": "SCAN: reaching disk start (0)"})
                sequence.append(0)
                current = 0
            move(right, "→")

    return _pack("SCAN", head, sequence, steps, disk_size)


# ── 4. C-SCAN ─────────────────────────────────────────────────────────────────

def disk_cscan(requests: list[int], head: int, disk_size: int = 200) -> dict:
    right    = sorted([r for r in requests if r >= head])
    left     = sorted([r for r in requests if r < head])
    current  = head
    sequence = [head]
    steps    = []

    for t in right:
        dist = abs(t - current)
        steps.append({"from": current, "to": t, "distance": dist,
                      "desc": f"C-SCAN →: serving {t}"})
        sequence.append(t)
        current = t

    if left:
        # Jump to beginning
        steps.append({"from": current, "to": disk_size - 1,
                      "distance": disk_size - 1 - current,
                      "desc": f"C-SCAN: reaching end ({disk_size-1})"})
        sequence.append(disk_size - 1)
        steps.append({"from": disk_size - 1, "to": 0,
                      "distance": disk_size - 1,
                      "desc": "C-SCAN: wrapping to start (0)"})
        sequence.append(0)
        current = 0
        for t in left:
            dist = abs(t - current)
            steps.append({"from": current, "to": t, "distance": dist,
                          "desc": f"C-SCAN →: serving {t}"})
            sequence.append(t)
            current = t

    return _pack("C-SCAN", head, sequence, steps, disk_size)


# ── 5. LOOK ───────────────────────────────────────────────────────────────────

def disk_look(requests: list[int], head: int, disk_size: int = 200,
              direction: str = "right") -> dict:
    left  = sorted([r for r in requests if r < head], reverse=True)
    right = sorted([r for r in requests if r >= head])
    current  = head
    sequence = [head]
    steps    = []

    def move(targets, label):
        nonlocal current
        for t in targets:
            dist = abs(t - current)
            steps.append({"from": current, "to": t, "distance": dist,
                          "desc": f"LOOK {label}: serving {t}"})
            sequence.append(t)
            current = t

    if direction == "right":
        move(right, "→")
        move(left,  "←")
    else:
        move(left,  "←")
        move(right, "→")

    return _pack("LOOK", head, sequence, steps, disk_size)


# ── 6. C-LOOK ─────────────────────────────────────────────────────────────────

def disk_clook(requests: list[int], head: int, disk_size: int = 200) -> dict:
    right    = sorted([r for r in requests if r >= head])
    left     = sorted([r for r in requests if r < head])
    current  = head
    sequence = [head]
    steps    = []

    for t in right:
        dist = abs(t - current)
        steps.append({"from": current, "to": t, "distance": dist,
                      "desc": f"C-LOOK →: serving {t}"})
        sequence.append(t)
        current = t

    if left:
        steps.append({"from": current, "to": left[0],
                      "distance": current - left[0],
                      "desc": f"C-LOOK: jump to smallest request ({left[0]})"})
        sequence.append(left[0])
        current = left[0]
        for t in left[1:]:
            dist = abs(t - current)
            steps.append({"from": current, "to": t, "distance": dist,
                          "desc": f"C-LOOK →: serving {t}"})
            sequence.append(t)
            current = t

    return _pack("C-LOOK", head, sequence, steps, disk_size)


# ── Dispatcher ────────────────────────────────────────────────────────────────

def run_disk(algorithm: str, requests: list[int], head: int,
             disk_size: int = 200, direction: str = "right") -> dict:
    alg = algorithm.lower()
    if   alg == "fcfs":   return disk_fcfs(requests, head, disk_size)
    elif alg == "sstf":   return disk_sstf(requests, head, disk_size)
    elif alg == "scan":   return disk_scan(requests, head, disk_size, direction)
    elif alg == "cscan":  return disk_cscan(requests, head, disk_size)
    elif alg == "look":   return disk_look(requests, head, disk_size, direction)
    elif alg == "clook":  return disk_clook(requests, head, disk_size)
    else:
        raise ValueError(f"Unknown disk algorithm: {algorithm}")
