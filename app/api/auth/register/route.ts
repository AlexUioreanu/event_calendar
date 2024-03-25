import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    console.log({ email, password, name });

    const hashedPassword = await hash(password, 10);

    const response = await sql`
      INSERT INTO users (email, password,name)
      VALUES (${email},${hashedPassword},${name})`;
    return NextResponse.json({ message: "Succes" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" });
  }
}
