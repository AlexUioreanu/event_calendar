"use client";
import React from "react";

export default function ErrorBoundry({ error }: { error: Error }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "red",
        fontSize: "24px",
        textAlign: "center",
      }}
    >
  You&apos;ve got this error: {error.message}
    </div>
  );
}
