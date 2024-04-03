import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";

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

        console.log({ credentials });
        try {
          const response =
            await sql`SELECT * FROM users WHERE email = ${credentials?.email} `;

          const user = response.rows[0];
          console.log({ user });

          const passCorrect = await compare(
            credentials.password,
            user.password
          );

          console.log({ passCorrect });
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
          console.log({ e });
          console.error("Error during authorization:", e);
          return null;
        }
      },
    }),
  ],
});

export { handler as GET, handler as POST };
