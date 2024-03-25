"use client";
import React from "react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        404 - Page Not Found
      </h1>
      <p style={{ marginBottom: "2rem" }}>
        Oops! The page you're looking for doesn't exist.dsads
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          cursor: "pointer",
          backgroundColor: "red",
          color: "#ffffff",
          border: "none",
          borderRadius: "5px",
          outline: "none",
        }}
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
