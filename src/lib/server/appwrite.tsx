// src/lib/server/appwrite.ts
"use server";

import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

interface AppwriteClientWrapper {
  readonly account: Account;
}

export async function createSessionClient(): Promise<AppwriteClientWrapper> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  if (!endpoint || !project) {
    throw new Error("Missing Appwrite endpoint or project ID in environment variables.");
  }

  const client = new Client().setEndpoint(endpoint).setProject(project);

  const session = (await cookies()).get("my-custom-session");
  if (!session?.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account(): Account {
      return new Account(client);
    },
  };
}

export async function createAdminClient(): Promise<AppwriteClientWrapper> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const key = process.env.NEXT_APPWRITE_KEY;

  if (!endpoint || !project || !key) {
    throw new Error("Missing Appwrite endpoint, project ID, or API key in environment variables.");
  }

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(key);

  return {
    get account(): Account {
      return new Account(client);
    },
  };
}
