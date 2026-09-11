import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/lib/drizzle/schema";

function isConfigured(value: string | undefined) {
  const normalized = value?.trim();
  return Boolean(normalized && !normalized.startsWith("your-"));
}

function getConfiguredValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

/**
 * The db client is created lazily inside the NextAuth config function so no
 * module-level global client is kept around (Cloudflare Workers isolates are
 * shared across requests).
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const db = getDb();
  const providers = [];
  const authSecret = getConfiguredValue(process.env.AUTH_SECRET);

  if (isConfigured(process.env.AUTH_GOOGLE_ID) && isConfigured(process.env.AUTH_GOOGLE_SECRET)) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      }),
    );
  }

  if (isConfigured(process.env.AUTH_GITHUB_ID) && isConfigured(process.env.AUTH_GITHUB_SECRET)) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
      }),
    );
  }

  return {
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    secret: authSecret,
    session: { strategy: "database" },
    trustHost: true,
    pages: {
      signIn: "/login",
    },
    providers,
  };
});
