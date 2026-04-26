import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.algorithms.scheduling import run_scheduling
from app.algorithms.memory     import run_memory
from app.algorithms.disk       import run_disk
from app.algorithms.deadlock   import run_deadlock


# ── Scheduling ────────────────────────────────────────────────────────────────

PROCS = [
    {"pid": "P1", "arrival": 0, "burst": 5, "priority": 2},
    {"pid": "P2", "arrival": 2, "burst": 3, "priority": 1},
    {"pid": "P3", "arrival": 4, "burst": 1, "priority": 3},
]

def test_fcfs():
    r = run_scheduling("fcfs", PROCS)
    assert r["gantt"][0]["pid"] == "P1"
    assert r["avg_waiting"] >= 0

def test_sjf():
    r = run_scheduling("sjf", PROCS)
    assert "gantt" in r and len(r["gantt"]) > 0

def test_srtf():
    r = run_scheduling("srtf", PROCS)
    assert r["avg_waiting"] <= run_scheduling("fcfs", PROCS)["avg_waiting"]

def test_rr():
    r = run_scheduling("rr", PROCS, quantum=2)
    assert r["algorithm"] == "Round Robin"

def test_priority_np():
    r = run_scheduling("priority", PROCS)
    assert "metrics" in r

def test_priority_p():
    r = run_scheduling("priority_p", PROCS)
    assert len(r["gantt"]) >= len(PROCS)

def test_mlfq():
    r = run_scheduling("mlfq", PROCS, quantum=2, queues=3)
    assert r["algorithm"] == "MLFQ"

def test_unknown_algo():
    with pytest.raises(ValueError):
        run_scheduling("nonexistent", PROCS)


# ── Memory ────────────────────────────────────────────────────────────────────

PAGES   = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
FRAMES  = 3

def test_fifo_memory():
    r = run_memory("fifo", PAGES, FRAMES)
    assert r["fault_count"] + r["hit_count"] == len(PAGES)

def test_lru_memory():
    r = run_memory("lru", PAGES, FRAMES)
    assert 0 <= r["hit_rate"] <= 100

def test_optimal_memory():
    r = run_memory("optimal", PAGES, FRAMES)
    lru_r = run_memory("lru", PAGES, FRAMES)
    assert r["fault_count"] <= lru_r["fault_count"]   # Optimal ≤ LRU faults

def test_lfu_memory():
    r = run_memory("lfu", PAGES, FRAMES)
    assert r["fault_rate"] + r["hit_rate"] == pytest.approx(100, abs=0.1)

def test_clock_memory():
    r = run_memory("clock", PAGES, FRAMES)
    assert "states" in r


# ── Disk ─────────────────────────────────────────────────────────────────────

REQS = [98, 183, 37, 122, 14, 124, 65, 67]
HEAD = 53

def test_fcfs_disk():
    r = run_disk("fcfs", REQS, HEAD)
    assert r["seek_sequence"][0] == HEAD

def test_sstf_disk():
    r = run_disk("sstf", REQS, HEAD)
    assert r["total_seek_distance"] <= run_disk("fcfs", REQS, HEAD)["total_seek_distance"]

def test_scan_disk():
    r = run_disk("scan", REQS, HEAD)
    assert "seek_sequence" in r

def test_look_disk():
    r = run_disk("look", REQS, HEAD)
    assert r["total_seek_distance"] <= run_disk("scan", REQS, HEAD)["total_seek_distance"]

def test_cscan_disk():
    r = run_disk("cscan", REQS, HEAD)
    assert r["algorithm"] == "C-SCAN"

def test_clook_disk():
    r = run_disk("clook", REQS, HEAD)
    assert r["algorithm"] == "C-LOOK"


# ── Deadlock ─────────────────────────────────────────────────────────────────

ALLOC   = [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]
MAX_N   = [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]
AVAIL   = [3,3,2]

def test_bankers_safe():
    r = run_deadlock(ALLOC, MAX_N, AVAIL)
    assert r["is_safe"] is True
    assert len(r["safe_sequence"]) == 5

def test_bankers_request_granted():
    r = run_deadlock(ALLOC, MAX_N, AVAIL, request_pid=1, request=[1,0,2])
    assert r["request_granted"] is True

def test_bankers_request_denied():
    # Request more than available
    r = run_deadlock(ALLOC, MAX_N, AVAIL, request_pid=0, request=[5,5,5])
    assert r["request_granted"] is False
