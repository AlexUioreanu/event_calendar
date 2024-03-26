"use client";

import OutlinedTextField from "@/app/components/OutlinedTextField";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import Link from "@mui/material/Link";
import { whiteButtonOutlineStyles } from "../utils";

export default function Form() {
  const router = useRouter();

  const [inputs, setinputs] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setinputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await signIn("credentials", {
      email: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    });
    console.log(`login response=${response}`);
    if (response?.ok) {
      console.log(`login response=${response}`);
      router.push("/calendar");
      router.refresh();
    } else {
      throw Error("failed to log in");
    }
  };

  return (
    <div className="signInSignUpContainer">
      <div
        style={{
          maxWidth: "500px",
          margin: "auto",
          marginTop: "auto",
          padding: "20px",
          borderRadius: "2rem",
          backgroundColor: "#fff",
          boxShadow: " 0 1.5rem 80px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "black",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Welcome
          </h1>
          <p style={{ fontSize: "24px", fontWeight: "initial" }}>
            Please enter your credentials
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 w-96 mt-10 "
        >
          <OutlinedTextField
            name="username"
            label="Username"
            onChange={handleChange}
            value={inputs.username}
            required
            sx={whiteButtonOutlineStyles}
          />
          <OutlinedTextField
            name="password"
            label="Password"
            type="password"
            onChange={handleChange}
            value={inputs.password}
            required
            sx={whiteButtonOutlineStyles}
          />
          <button
            type="submit"
            className="loginButton"
            style={{
              marginTop: "1rem",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
