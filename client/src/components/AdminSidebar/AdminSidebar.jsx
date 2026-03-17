import React from "react";

const Sidebar = () => {
  return (
    <div style={styles.sidebar}>
      <h2>Menu</h2>
      <ul style={styles.menu}>
        <li>Dashboard</li>
        <li>Loans</li>
        <li>Applications</li>
        <li>Settings</li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    backgroundColor: "#1F2937", // dark gray
    color: "white",
    padding: "20px",
    boxSizing: "border-box",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },
};

export default Sidebar;