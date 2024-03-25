"use client";

import OutlinedTextField from "@/app/components/OutlinedTextField";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import Link from "@mui/material/Link";
import { whiteButtonOutlineStyles } from "@/utils";

export default function Form() {
  const router = useRouter();

  const [inputs, setinputs] = useState({
    name: "",
    email: "",
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
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    console.log(`login response=${response}`);
    if (response?.ok) {
      console.log(`login response=${response}`);
      router.push("/dashboard");
      router.refresh();
    } else {
      throw Error("failed to log in");
    }
  };

  return (
    <div className="signInSignUpContainer">
      <Image
        className="mb-56"
        width={300}
        height={300}
        src="/logo.svg"
        alt="Logo"
      />

      <div
        style={{
          color: "white",
          textAlign: "center",
        }}
      >
        <h1
          style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}
        >
          Welcome
        </h1>
        <p style={{ fontSize: "24px", fontWeight: "initial" }}>
          Please enter your credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-96 mt-10 ">
        <OutlinedTextField
          name="email"
          label="Email"
          type="email"
          onChange={handleChange}
          value={inputs.email}
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
          style={{
            backgroundColor: "#FFA500",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            outline: "none",
          }}
        >
          Login
        </button>
        <Link
          href="/register"
          sx={{
            textDecoration: "none",
            color: "#056bf0",
            fontWeight: "normal",
            marginBottom: "50px",
          }}
        >
          You don't have an account? SignUp
        </Link>
      </form>
    </div>
  );
}
