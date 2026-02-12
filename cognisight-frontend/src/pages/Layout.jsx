import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.page}>
      {/* Sidebar stays same – layout reacts around it */}
      <Sidebar />

      <main
        style={{
          ...styles.main,
          marginLeft: isMobile ? 0 : 260,
        }}
      >
        <div style={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/* ---------- styles ---------- */
const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(180deg,#071233 0%, #0f172a 60%)",
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
  },

  main: {
    flex: 1,
    transition: "margin-left 240ms ease",
    padding: "24px",
    boxSizing: "border-box",
  },

  contentWrapper: {
    minHeight: "calc(100vh - 48px)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 18px 50px rgba(2,6,23,0.55)",
    border: "1px solid rgba(255,255,255,0.04)",
    backdropFilter: "blur(8px)",
  },
};
