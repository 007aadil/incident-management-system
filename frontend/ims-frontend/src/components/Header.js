import React from "react";

function Header() {
  return (
    <div style={styles.header}>
      <h2 style={{ margin: 0 }}>Incident Management System</h2>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#1e293b",
    color: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  },
  loginBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Header;