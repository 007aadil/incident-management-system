const pool = require("./db");
const { retryQuery } = require("./db");
const { hasRCA } = require("./rcaManager");

const DEBOUNCE_WINDOW = 10000;

function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

function getSeverity(component) {
  if (component === "DB" || component === "RDBMS") return "P0";
  if (component === "API") return "P1";
  if (component === "CACHE") return "P2";
  return "P3";
}

const validTransitions = {
  OPEN: ["INVESTIGATING"],
  INVESTIGATING: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: []
};

async function handleSignal(signal) {
  const { component, type, message } = signal;
  const now = Date.now();

  console.log(`Signal received → ${component}`);

  const existing = await retryQuery(
    `SELECT * FROM incidents
     WHERE component = $1 AND status != 'CLOSED'
     ORDER BY last_updated DESC
     LIMIT 1`,
    [component]
  );

  let incident;

  if (existing.rows.length > 0) {
    const found = existing.rows[0];

    if (now - Number(found.last_updated) <= DEBOUNCE_WINDOW) {
      incident = found;

      await retryQuery(
        `UPDATE incidents SET last_updated = $1 WHERE id = $2`,
        [now, incident.id]
      );

      console.log(`Using existing incident: ${incident.id}`);
    }
  }

  if (!incident) {
    const id = generateId();
    const severity = getSeverity(component);

    await retryQuery(
      `INSERT INTO incidents
       (id, component, status, start_time, last_updated, end_time, mttr, severity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, component, "OPEN", now, now, null, null, severity]
    );

    incident = {
      id,
      component,
      status: "OPEN",
      start_time: now,
      last_updated: now,
      severity
    };

    console.log(`New Incident Created: ${id}`);
  }

  await retryQuery(
    `INSERT INTO signals
     (incident_id, component, type, message, timestamp)
     VALUES ($1, $2, $3, $4, $5)`,
    [incident.id, component, type, message, now]
  );

  console.log(`Signal linked to incident ${incident.id}`);
}

async function updateIncidentStatus(incidentId, newStatus) {
  const result = await retryQuery(
    `SELECT * FROM incidents WHERE id = $1`,
    [incidentId]
  );

  if (result.rows.length === 0) {
    throw new Error("Incident not found");
  }

  const incident = result.rows[0];
  const currentStatus = incident.status;

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
  }

  if (newStatus === "CLOSED" && !hasRCA(incidentId)) {
    throw new Error("Cannot close incident without RCA");
  }

  const now = Date.now();

  if (newStatus === "CLOSED") {
    const mttr = now - Number(incident.start_time);

    await retryQuery(
      `UPDATE incidents
       SET status = $1, end_time = $2, mttr = $3, last_updated = $4
       WHERE id = $5`,
      [newStatus, now, mttr, now, incidentId]
    );
  } else {
    await retryQuery(
      `UPDATE incidents
       SET status = $1, last_updated = $2
       WHERE id = $3`,
      [newStatus, now, incidentId]
    );
  }

  console.log(`Incident ${incidentId} → ${newStatus}`);
}

module.exports = {
  handleSignal,
  updateIncidentStatus
};