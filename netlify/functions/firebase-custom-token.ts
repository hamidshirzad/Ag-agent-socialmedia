import type { Handler } from "@netlify/functions";
import admin from "firebase-admin";
import { createRemoteJWKSet, jwtVerify } from "jose";

if (!admin.apps.length) {
  const svcStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svcStr) {
    const svc = JSON.parse(Buffer.from(svcStr, "base64").toString("utf8"));
    admin.initializeApp({ credential: admin.credential.cert(svc) });
  } else {
    // Fallback: project-only init (custom-token creation needs a service account key)
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "gen-lang-client-0894579148" });
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { idToken } = JSON.parse(event.body ?? "{}") as { idToken?: string };
  if (!idToken) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing idToken" }) };
  }

  const domain    = process.env.AUTH0_DOMAIN;
  const clientId  = process.env.AUTH0_CLIENT_ID;

  if (!domain || !clientId) {
    return { statusCode: 500, body: JSON.stringify({ error: "Auth0 env vars not set (AUTH0_DOMAIN, AUTH0_CLIENT_ID)" }) };
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL(`https://${domain}/.well-known/jwks.json`)
    );

    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: clientId,
      issuer: `https://${domain}/`,
    });

    // Firebase UIDs cannot contain '|'
    const uid = (payload.sub as string).replace(/\|/g, "_");

    const firebaseToken = await admin.auth().createCustomToken(uid, {
      email:          payload.email ?? "",
      email_verified: payload.email_verified ?? false,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseToken }),
    };
  } catch (err: any) {
    console.error("[firebase-custom-token]", err?.message ?? err);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Authentication failed" }),
    };
  }
};
