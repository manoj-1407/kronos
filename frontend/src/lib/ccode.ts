export const C_CODE: Record<string, string> = {
  // ── CPU ───────────────────────────────────────────────────────────────────
  fcfs: `/* First Come First Served — Non-Preemptive */
typedef struct { char pid[4]; int arrival, burst, completion; } Process;

void fcfs(Process p[], int n) {
    /* Sort by arrival time */
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (p[j].arrival > p[j+1].arrival) {
                Process t = p[j]; p[j] = p[j+1]; p[j+1] = t;
            }
    int time = 0;
    for (int i = 0; i < n; i++) {
        if (time < p[i].arrival) time = p[i].arrival;
        printf("[%d-%d] %s\\n", time, time + p[i].burst, p[i].pid);
        time            += p[i].burst;
        p[i].completion  = time;
    }
}`,

  sjf: `/* Shortest Job First — Non-Preemptive */
void sjf(Process p[], int n) {
    int done[n]; memset(done, 0, sizeof done);
    int time = 0, completed = 0;
    while (completed < n) {
        int sel = -1, minBurst = INT_MAX;
        for (int i = 0; i < n; i++)
            if (!done[i] && p[i].arrival <= time && p[i].burst < minBurst)
                { sel = i; minBurst = p[i].burst; }
        if (sel == -1) { time++; continue; }
        time           += p[sel].burst;
        p[sel].completion = time;
        done[sel] = 1; completed++;
    }
}`,

  srtf: `/* Shortest Remaining Time First — Preemptive SJF */
void srtf(Process p[], int n) {
    int rem[n], done = 0, time = 0, prev = -1;
    for (int i = 0; i < n; i++) rem[i] = p[i].burst;
    while (done < n) {
        int sel = -1, minRem = INT_MAX;
        for (int i = 0; i < n; i++)
            if (p[i].arrival <= time && rem[i] > 0 && rem[i] < minRem)
                { sel = i; minRem = rem[i]; }
        if (sel == -1) { time++; continue; }
        if (prev != sel) printf("  ctx-switch → P%d @ t=%d\\n", sel, time);
        rem[sel]--; time++;
        if (rem[sel] == 0) { p[sel].completion = time; done++; }
        prev = sel;
    }
}`,

  rr: `/* Round Robin — Preemptive */
#define MAX 100
void round_robin(Process p[], int n, int quantum) {
    int rem[n], queue[MAX*10], front=0, rear=0, time=0, done=0;
    for (int i=0; i<n; i++) rem[i] = p[i].burst;
    queue[rear++] = 0;          /* enqueue first process */
    while (done < n) {
        int i = queue[front++];
        int run = (rem[i] < quantum) ? rem[i] : quantum;
        printf("[%d-%d] P%d\\n", time, time+run, i);
        rem[i] -= run; time += run;
        /* Enqueue newly arrived processes */
        for (int j=0; j<n; j++)
            if (p[j].arrival > time-run && p[j].arrival <= time && rem[j]>0)
                queue[rear++] = j;
        if (rem[i] > 0) queue[rear++] = i;
        else { p[i].completion = time; done++; }
    }
}`,

  priority: `/* Priority Scheduling — Non-Preemptive (lower # = higher priority) */
void priority_np(Process p[], int n) {
    int done[n]; memset(done, 0, sizeof done);
    int time=0, completed=0;
    while (completed < n) {
        int sel=-1, best=INT_MAX;
        for (int i=0; i<n; i++)
            if (!done[i] && p[i].arrival<=time && p[i].priority<best)
                { sel=i; best=p[i].priority; }
        if (sel==-1) { time++; continue; }
        time += p[sel].burst;
        p[sel].completion=time;
        done[sel]=1; completed++;
    }
}`,

  priority_p: `/* Priority Scheduling — Preemptive */
void priority_p(Process p[], int n) {
    int rem[n], done=0, time=0;
    for (int i=0; i<n; i++) rem[i]=p[i].burst;
    while (done < n) {
        int sel=-1, best=INT_MAX;
        for (int i=0; i<n; i++)
            if (p[i].arrival<=time && rem[i]>0 && p[i].priority<best)
                { sel=i; best=p[i].priority; }
        if (sel==-1) { time++; continue; }
        rem[sel]--; time++;
        if (rem[sel]==0) { p[sel].completion=time; done++; }
    }
}`,

  mlfq: `/* Multi-Level Feedback Queue (3 queues) */
#define QUEUES 3
int quantum[QUEUES] = {2, 4, 8};   /* Q0=RR/2, Q1=RR/4, Q2=FCFS */

void mlfq(Process p[], int n) {
    /* Each process starts in Q0 */
    /* On quantum expiry → demote to next queue */
    /* In Q2 (lowest) → run to completion (FCFS) */
    int level[n]; memset(level, 0, sizeof level);
    int rem[n];
    for (int i=0; i<n; i++) rem[i]=p[i].burst;
    int time=0, done=0;
    while (done < n) {
        for (int q=0; q<QUEUES && done<n; q++) {
            for (int i=0; i<n; i++) {
                if (level[i]!=q || rem[i]==0) continue;
                if (p[i].arrival > time) continue;
                int run = (q<QUEUES-1) ? quantum[q] : rem[i];
                run = (rem[i]<run) ? rem[i] : run;
                printf("Q%d [%d-%d] P%d\\n", q, time, time+run, i);
                rem[i]-=run; time+=run;
                if (rem[i]==0) { p[i].completion=time; done++; }
                else if (q<QUEUES-1) level[i]++;  /* demote */
            }
        }
    }
}`,

  // ── Memory ────────────────────────────────────────────────────────────────
  fifo: `/* FIFO Page Replacement */
int fifo(int pages[], int n, int frames) {
    int f[frames], order[n], front=0, rear=0, faults=0;
    memset(f, -1, sizeof f);
    for (int i=0; i<n; i++) {
        int hit=0;
        for (int j=0; j<frames; j++) if (f[j]==pages[i]) { hit=1; break; }
        if (!hit) {
            faults++;
            if (rear - front < frames)      /* free slot */
                f[rear % frames] = pages[i];
            else {
                f[front % frames] = pages[i];  /* evict oldest */
                front++;
            }
            order[rear++ % frames] = pages[i];
        }
    }
    return faults;
}`,

  lru: `/* Least Recently Used Page Replacement */
int lru(int pages[], int n, int frames) {
    int f[frames], last[frames], faults=0;
    memset(f, -1, sizeof f);
    for (int t=0; t<n; t++) {
        int hit=-1;
        for (int j=0; j<frames; j++) if (f[j]==pages[t]) { hit=j; break; }
        if (hit >= 0) { last[hit]=t; continue; }
        faults++;
        /* Find LRU frame */
        int pos=0, minT=INT_MAX;
        for (int j=0; j<frames; j++)
            if (f[j]==-1) { pos=j; minT=-1; break; }
            else if (last[j]<minT) { minT=last[j]; pos=j; }
        f[pos]=pages[t]; last[pos]=t;
    }
    return faults;
}`,

  optimal: `/* Optimal (Bélády's) Page Replacement */
int next_use(int pages[], int n, int from, int page) {
    for (int i=from; i<n; i++) if (pages[i]==page) return i;
    return INT_MAX;    /* page not used again */
}
int optimal(int pages[], int n, int frames) {
    int f[frames], faults=0;
    memset(f, -1, sizeof f);
    for (int t=0; t<n; t++) {
        int hit=0;
        for (int j=0; j<frames; j++) if (f[j]==pages[t]) { hit=1; break; }
        if (hit) continue;
        faults++;
        int pos=0, farthest=-1;
        for (int j=0; j<frames; j++) {
            if (f[j]==-1) { pos=j; break; }
            int d=next_use(pages,n,t+1,f[j]);
            if (d>farthest) { farthest=d; pos=j; }
        }
        f[pos]=pages[t];
    }
    return faults;
}`,

  lfu: `/* Least Frequently Used Page Replacement */
int lfu(int pages[], int n, int frames) {
    int f[frames], freq[frames], last[frames], faults=0;
    memset(f, -1, sizeof f); memset(freq, 0, sizeof freq);
    for (int t=0; t<n; t++) {
        int hit=-1;
        for (int j=0; j<frames; j++) if (f[j]==pages[t]) { hit=j; break; }
        if (hit>=0) { freq[hit]++; last[hit]=t; continue; }
        faults++;
        int pos=0, minF=INT_MAX, minT=INT_MAX;
        for (int j=0; j<frames; j++) {
            if (f[j]==-1) { pos=j; break; }
            if (freq[j]<minF || (freq[j]==minF && last[j]<minT))
                { minF=freq[j]; minT=last[j]; pos=j; }
        }
        f[pos]=pages[t]; freq[pos]=1; last[pos]=t;
    }
    return faults;
}`,

  clock: `/* Clock (Second Chance) Page Replacement */
int clock_alg(int pages[], int n, int frames) {
    int f[frames], ref[frames], hand=0, faults=0;
    memset(f,-1,sizeof f); memset(ref,0,sizeof ref);
    for (int t=0; t<n; t++) {
        int hit=-1;
        for (int j=0; j<frames; j++) if (f[j]==pages[t]) { hit=j; break; }
        if (hit>=0) { ref[hit]=1; continue; }
        faults++;
        while (ref[hand]) { ref[hand]=0; hand=(hand+1)%frames; }
        f[hand]=pages[t]; ref[hand]=1;
        hand=(hand+1)%frames;
    }
    return faults;
}`,

  // ── Disk ─────────────────────────────────────────────────────────────────
  sstf: `/* Shortest Seek Time First */
int sstf(int req[], int n, int head) {
    int done[n], total=0; memset(done,0,sizeof done);
    for (int i=0; i<n; i++) {
        int best=-1, minD=INT_MAX;
        for (int j=0; j<n; j++) {
            if (!done[j] && abs(req[j]-head)<minD)
                { minD=abs(req[j]-head); best=j; }
        }
        total += minD;
        printf("%d → %d (dist=%d)\\n", head, req[best], minD);
        head=req[best]; done[best]=1;
    }
    return total;
}`,

  scan: `/* SCAN (Elevator) Disk Scheduling */
int cmp_asc(const void*a,const void*b){return *(int*)a-*(int*)b;}

int scan(int req[], int n, int head, int direction) {
    int arr[n+1]; memcpy(arr,req,n*sizeof(int));
    arr[n]=head; qsort(arr,n+1,sizeof(int),cmp_asc);
    int pos=0; while(arr[pos]!=head) pos++;
    int total=0, cur=head;
    if (direction>0) {           /* moving right first */
        for (int i=pos+1; i<=n; i++)
            { total+=abs(arr[i]-cur); cur=arr[i]; printf("%d ",arr[i]); }
        for (int i=pos-1; i>=0; i--)
            { total+=abs(arr[i]-cur); cur=arr[i]; printf("%d ",arr[i]); }
    } else {
        for (int i=pos-1; i>=0; i--)
            { total+=abs(arr[i]-cur); cur=arr[i]; printf("%d ",arr[i]); }
        for (int i=pos+1; i<=n; i++)
            { total+=abs(arr[i]-cur); cur=arr[i]; printf("%d ",arr[i]); }
    }
    return total;
}`,

  // ── Deadlock ──────────────────────────────────────────────────────────────
  bankers: `/* Banker's Algorithm — Safety Check */
#define P 5   /* processes */
#define R 3   /* resource types */

int safe_state(int alloc[P][R], int need[P][R],
               int avail[R]) {
    int work[R], finish[P]={0}, seq[P], cnt=0;
    memcpy(work, avail, sizeof work);
    while (cnt < P) {
        int found = 0;
        for (int i=0; i<P; i++) {
            if (finish[i]) continue;
            int ok=1;
            for (int j=0; j<R; j++)
                if (need[i][j] > work[j]) { ok=0; break; }
            if (ok) {
                for (int j=0; j<R; j++)
                    work[j] += alloc[i][j];
                finish[i]=1; seq[cnt++]=i; found=1;
            }
        }
        if (!found) return 0;   /* UNSAFE */
    }
    printf("Safe sequence: ");
    for (int i=0; i<P; i++) printf("P%d ", seq[i]);
    return 1;                   /* SAFE */
}`,
}
