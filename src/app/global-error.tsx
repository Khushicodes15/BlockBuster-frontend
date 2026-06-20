"use client";

// Replaces the root layout when an error escapes it, so it cannot rely on
// globals.css being loaded — keep styling inline.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          background: "#FAFAFA",
          color: "#111827",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>The console hit a fatal error</h1>
        <p style={{ fontSize: 14, color: "#4B5563", maxWidth: 420 }}>
          Please reload the page. If the problem persists, contact the operations administrator.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#727038",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
