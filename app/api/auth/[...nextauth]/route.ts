import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";

// Simple in-memory rate limiter (per process; resets on redeploy)
// Keyed by email. For production, replace with a shared store (Redis/Upstash)
const attemptStore: Record<string, { count: number; first: number }> = {};
const MAX_ATTEMPTS = 5; // per window
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attemptStore[key];
  if (!entry) {
    attemptStore[key] = { count: 1, first: now };
    return false;
  }
  if (now - entry.first > WINDOW_MS) {
    attemptStore[key] = { count: 1, first: now };
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        const emailKey = credentials.email?.toLowerCase() || "unknown";
        if (isRateLimited(emailKey)) {
          console.warn(`Rate limit exceeded for ${emailKey}`);
          return null;
        }

        try {
          const response =
            await sql`SELECT * FROM users WHERE email = ${credentials?.email} `;

          const user = response.rows[0];
          if (!user) {
            console.warn(`Login attempt for unknown email ${credentials.email}`);
            return null;
          }

          const passCorrect = await compare(
            credentials.password,
            user.password
          );

          if (passCorrect) {
            return {
              id: user.id,
              email: user.email,
            };
          } else {
            console.error(`Password check failed for user ${user.email}`);
            return null;
          }
        } catch (e) {
          console.error("Error during authorization:", e);
          return null;
        }
      },
    }),
  ],
});

export { handler as GET, handler as POST };
