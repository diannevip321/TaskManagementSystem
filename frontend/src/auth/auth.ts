import { CONFIG } from "../config";

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

export function buildLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: CONFIG.COGNITO_APP_CLIENT_ID,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: CONFIG.REDIRECT_URI,
  });

  return `${CONFIG.COGNITO_DOMAIN}/login?${params.toString()}`;
}

export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: CONFIG.COGNITO_APP_CLIENT_ID,
    logout_uri: CONFIG.REDIRECT_URI,
  });

  return `${CONFIG.COGNITO_DOMAIN}/logout?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<CognitoTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CONFIG.COGNITO_APP_CLIENT_ID,
    code,
    redirect_uri: CONFIG.REDIRECT_URI,
  });

  const res = await fetch(`${CONFIG.COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const json = await res.json();

  if (!res.ok) {
    const msg =
      json.error_description ||
      json.error ||
      `Token request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return {
    idToken: json.id_token,
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
  };
}


