// src/auth/auth.ts
import { CONFIG } from "../config";

export function buildLoginUrl() {
  const redirectUri = window.location.origin; // http://localhost:5173

  const params = new URLSearchParams({
    client_id: CONFIG.COGNITO_APP_CLIENT_ID,
    response_type: "code",
    scope: "openid email",
    redirect_uri: redirectUri,
  });

  return `${CONFIG.COGNITO_DOMAIN}/login?${params.toString()}`;
}

export function buildLogoutUrl() {
  const logoutUri = window.location.origin; // http://localhost:5173

  const params = new URLSearchParams({
    client_id: CONFIG.COGNITO_APP_CLIENT_ID,
    logout_uri: logoutUri,
  });

  return `${CONFIG.COGNITO_DOMAIN}/logout?${params.toString()}`;
}

