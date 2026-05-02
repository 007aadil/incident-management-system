import React, { useEffect, useState } from "react";
import { getIncidents, updateStatus } from "../api";
import RCAForm from "./RCAForm";

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch {
      console.error("Failed to fetch incidents");
    }
    setLoading(false);
  }

  const filtered = incidents.filter((inc) => {
    if (filter === "ALL") return true;
    return inc.status === filter;
  });

  const counts = {
    ALL: incidents.length,
    OPEN: incidents.filter(i => i.status === "OPEN").length,
    INVESTIGATING: incidents.filter(i => i.status === "INVESTIGATING").length,
    RESOLVED: incidents.filter(i => i.status === "RESOLVED").length,
    CLOSED: incidents.filter(i => i.status === "CLOSED").length
  };

  async function viewSignals(id) {
    const res = await fetch(`http://localhost:5000/incident/${id}/signals`);
    const data = await res.json();
    setSignals(data);
    setShowModal(true);
    setSelectedIncident(id);
  }

  function formatMTTR(ms) {
    if (!ms) return "—";
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return min > 0 ? `${min}m ${rem}s` : `${rem}s`;
  }

  function formatTime(ts) {
    return new Date(Number(ts)).toLocaleTimeString();
  }

  function getSeverityStyle(sev) {
    switch (sev) {
      case "P0": return { color: "#dc2626", fontWeight: "bold" };
      case "P1": return { color: "#f97316", fontWeight: "bold" };
      case "P2": return { color: "#eab308", fontWeight: "bold" };
      default: return { color: "#16a34a", fontWeight: "bold" };
    }
  }

  function getStatusStyle(status) {
    switch (status) {
      case "OPEN": return { background: "#fee2e2", color: "red" };
      case "INVESTIGATING": return { background: "#fef3c7", color: "#d97706" };
      case "RESOLVED": return { background: "#dbeafe", color: "#2563eb" };
      case "CLOSED": return { background: "#dcfce7", color: "green" };
      default: return {};
    }
  }

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Incident Dashboard</h1>

      {/* TABS */}
      <div style={styles.tabs}>
        {["ALL","OPEN","INVESTIGATING","RESOLVED","CLOSED"].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={filter === tab ? styles.activeTab : styles.tab}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#64748b" }}>
          No incidents found
        </p>
      )}

      {/* CARDS */}
      <div style={styles.grid}>
        {filtered.map((inc) => (
          <div key={inc.id} style={styles.card}>

            <div style={styles.rowTop}>
              <span style={styles.id}>{inc.id}</span>
              <span style={{ ...styles.status, ...getStatusStyle(inc.status) }}>
                {inc.status}
              </span>
            </div>

            <p>{inc.component}</p>

            <p style={styles.time}>
              Created: {formatTime(inc.start_time)}
            </p>

            <p>
              <strong>Severity:</strong>{" "}
              <span style={getSeverityStyle(inc.severity)}>
                {inc.severity || "P3"}
              </span>
            </p>

            <p>
              <strong>MTTR:</strong> {formatMTTR(inc.mttr)}
            </p>

            {/* ACTIONS */}
            <div style={styles.actions}>

              {/* LEFT SIDE */}
              <div style={styles.buttonGroup}>
                <button
                  style={styles.investigateBtn}
                  disabled={inc.status !== "OPEN"}
                  onClick={() => updateStatus(inc.id, "INVESTIGATING")}
                >
                  Investigate
                </button>

                <button
                  style={styles.resolveBtn}
                  disabled={inc.status !== "INVESTIGATING"}
                  onClick={() => updateStatus(inc.id, "RESOLVED")}
                >
                  Resolve
                </button>

                <button
                  style={styles.closeBtn}
                  disabled={inc.status !== "RESOLVED"}
                  onClick={() => updateStatus(inc.id, "CLOSED")}
                >
                  Close
                </button>
              </div>

              {/* RIGHT SIDE */}
              <div style={styles.buttonGroup}>
                <button
                  style={styles.rcaBtn}
                  onClick={() => setSelectedIncident(inc.id)}
                >
                  RCA
                </button>

                <button
                  style={styles.viewBtn}
                  onClick={() => viewSignals(inc.id)}
                >
                  View
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* RCA */}
      {selectedIncident && !showModal && (
        <RCAForm
          incidentId={selectedIncident}
          onClose={() => {
            setSelectedIncident(null);
            fetchData();
          }}
        />
      )}

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Signals for {selectedIncident}</h3>

            {signals.length === 0 ? (
              <p>No signals</p>
            ) : (
              signals.map((s, i) => (
                <div key={i} style={styles.signalCard}>
                  <p><strong>{s.component}</strong> - {s.type}</p>
                  <p>{s.message}</p>
                </div>
              ))
            )}

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const styles = {
  container: { padding: "20px", background: "#f1f5f9", minHeight: "100vh" },

  title: { fontSize: "24px", fontWeight: "bold" },

  tabs: { display: "flex", gap: "10px", margin: "20px 0" },

  tab: {
    padding: "6px 12px",
    background: "#e2e8f0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  activeTab: {
    padding: "6px 12px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "15px"
  },

  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  rowTop: { display: "flex", justifyContent: "space-between" },

  id: { fontWeight: "bold" },

  status: {
    padding: "4px 8px",
    borderRadius: "5px",
    fontSize: "12px"
  },

  time: { fontSize: "12px", color: "#64748b" },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px"
  },

  buttonGroup: {
    display: "flex",
    gap: "10px"
  },

  investigateBtn: {
    background: "#f59e0b",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none"
  },

  resolveBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none"
  },

  closeBtn: {
    background: "#22c55e",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none"
  },

  rcaBtn: {
    background: "white",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    padding: "6px 10px",
    borderRadius: "6px"
  },

  viewBtn: {
    background: "#6366f1",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "10px"
  },

  signalCard: {
    borderBottom: "1px solid #ddd",
    marginBottom: "10px",
    paddingBottom: "5px"
  }
};

export default IncidentList;