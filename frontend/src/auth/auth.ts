import { CONFIG } from "../config";

const {
  COGNITO_APP_CLIENT_ID,
  COGNITO_DOMAIN,
  REDIRECT_URI,
} = CONFIG;

const SCOPES = "openid email";

export const ACCESS_TOKEN_KEY = "tms_access_token";
const ID_TOKEN_KEY = "tms_id_token";
const REFRESH_TOKEN_KEY = "tms_refresh_token";
const PKCE_VERIFIER_KEY = "tms_pkce_verifier";

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  let binary = "";
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

export async function startLogin(): Promise<void> {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);

  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: COGNITO_APP_CLIENT_ID,
    response_type: "code",
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const url = `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
  console.log("Redirecting to authorize URL:", url);
  window.location.assign(url);
}

export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: COGNITO_APP_CLIENT_ID,
    logout_uri: REDIRECT_URI,
  });

  const url = `${COGNITO_DOMAIN}/logout?${params.toString()}`;
  console.log("Redirecting to logout URL:", url);
  return url;
}

export interface Tokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export function storeTokens(tokens: Tokens) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  sessionStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
  if (tokens.refresh_token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ID_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
}

export async function exchangeCodeForTokens(code: string): Promise<Tokens> {
  const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;

  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY) || "";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: COGNITO_APP_CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
  });

  if (verifier) {
    body.append("code_verifier", verifier);
  }

  console.log("Calling token endpoint:", tokenUrl, "body:", body.toString());

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const text = await res.text();
  console.log("Token response status", res.status, "body:", text);

  if (!res.ok) {
    throw new Error(text || `Token request failed with ${res.status}`);
  }

  const tokens = JSON.parse(text) as Tokens;
  console.log("Parsed tokens:", tokens);

  storeTokens(tokens);

  return tokens;
}