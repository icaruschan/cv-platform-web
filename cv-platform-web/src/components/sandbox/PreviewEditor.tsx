'use client';

import { Sandpack } from "@codesandbox/sandpack-react";
import { motion } from "framer-motion";

export default function PreviewEditor() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Our "Studio" Ease
            className="w-full h-[600px] border border-border rounded-xl overflow-hidden shadow-2xl"
        >
            <Sandpack
                template="react"
                theme="dark"
                options={{
                    showNavigator: true,
                    showTabs: true,
                    editorHeight: 600, // Fixed height for now
                }}
                files={{
                    "/App.js": `import React from "react";

export default function App() {
  return (
    <div style={{ 
      fontFamily: "system-ui, sans-serif", 
      textAlign: "center", 
      padding: "50px",
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #1a1a1a, #000)",
      color: "white"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        Antigravity Platform
      </h1>
      <p style={{ color: "#888", fontSize: "1.2rem" }}>
        Live AI Generation Preview
      </p>
      <div style={{ marginTop: "40px" }}>
        <button style={{
          background: "white",
          color: "black",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
          fontWeight: "bold"
        }}>
          Edit Me
        </button>
      </div>
    </div>
  );
}`
                }}
            />
        </motion.div>
    );
}
