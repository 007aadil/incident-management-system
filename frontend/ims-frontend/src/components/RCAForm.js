import React, { useState } from "react";
import { addRCA } from "../api";

function RCAForm({ incidentId, onClose }) {
  const [form, setForm] = useState({
    rootCause: "",
    fix: "",
    prevention: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    await addRCA(incidentId, form);
    alert("RCA added successfully!");
    onClose();
  }

  return (
    <div style={styles.card}>
      <h3>Add RCA for {incidentId}</h3>

      <input name="rootCause" placeholder="Root Cause" onChange={handleChange} />
      <input name="fix" placeholder="Fix" onChange={handleChange} />
      <input name="prevention" placeholder="Prevention" onChange={handleChange} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "8px",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }
};

export default RCAForm;