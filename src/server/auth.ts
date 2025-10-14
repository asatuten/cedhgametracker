import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

export const { handlers: authHandlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        console.log(`Login link for ${identifier}: ${url}`);
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? ""
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        name: { label: "Display Name", type: "text", placeholder: "Guest" }
      },
      async authorize(credentials) {
        const displayName = credentials?.name?.trim() || "Guest";
        const guestUser = await prisma.user.upsert({
          where: { email: `guest-${displayName.toLowerCase().replace(/[^a-z0-9]/g, "") || "anon"}@guest.local` },
          update: {},
          create: {
            name: displayName,
            email: `guest-${Date.now()}@guest.local`
          }
        });
        return { id: guestUser.id, name: guestUser.name ?? displayName };
      }
    })
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
});
