# Incident Management System (IMS)

A real-time Incident Management System inspired by SRE practices.
It ingests signals, groups them into incidents, enforces RCA, and tracks MTTR.

---

## Architecture

```text
React UI → Express API → Queue → Worker → PostgreSQL
```

* Signals are ingested via API
* Queue buffers high traffic
* Worker processes signals asynchronously
* PostgreSQL stores incidents & signals

---

##  Features

* Signal ingestion API
* Debounce logic (group signals into incidents)
* Incident lifecycle:

  * OPEN → INVESTIGATING → RESOLVED → CLOSED
* Mandatory RCA before closing
* MTTR calculation
* View raw signals per incident
* Rate limiting
* Health endpoint
* Dockerized PostgreSQL

---

##  Tech Stack

* Frontend: React
* Backend: Node.js, Express
* Database: PostgreSQL
* Queue: In-memory async queue
* DevOps: Docker

---

## Setup Instructions

## Running PostgreSQL with Docker

Make sure Docker Desktop is installed and running.

---

###  Step 1: Start Database

```bash
docker compose up -d

### Step 2 : Verify Container

docker ps

### Step 3 : Access PostgreSQL

docker exec -it ims-postgres psql -U postgres -d ims

### 2. Run Backend

```bash
cd backend
npm install
node src/index.js
```

---

### 3. Run Frontend

```bash
cd frontend\ims-frontend
npm install
npm start
```

---

##  API Example

### Send Signal

```bash
curl -X POST http://localhost:5000/signal \
-H "Content-Type: application/json" \
-d '{"component":"RDBMS","type":"CRITICAL","message":"Database down"}'
```

---

## Key Concepts

### Debouncing

Prevents duplicate incidents by grouping signals within a 10-second window.

### MTTR

```text
MTTR = end_time - start_time
```

### RCA Enforcement

Incident cannot be closed without Root Cause Analysis.

---

## Resilience

* Async processing via worker
* Rate limiting on ingestion API
* Retry logic for DB operations
* Health check endpoint (`/health`)
* Logs throughput (signals/sec)

---

##  Author

Aadil Hathim
B.Tech IT | DevOps & Cloud Enthusiast
