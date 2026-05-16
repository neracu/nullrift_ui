/**
 * Exchanges an IBM Cloud API key for a short-lived IAM access token.
 * watsonx ML endpoints require Bearer {IAM access token}, not the raw API key.
 */

const IBM_IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";
const IBM_APIKEY_GRANT_TYPE = "urn:ibm:params:oauth:grant-type:apikey";
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface IbmIamTokenResponse {
  access_token?: string;
  expires_in?: number;
}

let tokenCache: {
  apiKey: string;
  accessToken: string;
  expiresAtMs: number;
} | null = null;

/**
 * Returns a valid IAM access token for the given API key, using an in-memory cache until near expiry.
 */
export async function getIamAccessToken(apiKey: string): Promise<string> {
  const trimmedKey = apiKey.trim();
  const now = Date.now();
  if (
    tokenCache &&
    tokenCache.apiKey === trimmedKey &&
    now < tokenCache.expiresAtMs - TOKEN_REFRESH_BUFFER_MS
  ) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: IBM_APIKEY_GRANT_TYPE,
    apikey: trimmedKey,
  });

  const response = await fetch(IBM_IAM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const raw = await response.text();
  let parsed: IbmIamTokenResponse = {};
  try {
    parsed = JSON.parse(raw) as IbmIamTokenResponse;
  } catch {
    /* use empty */
  }

  if (!response.ok) {
    throw new Error(
      `IAM token request failed (${response.status}): ${raw.slice(0, 200)}`
    );
  }

  const accessToken = parsed.access_token;
  const expiresInSec = typeof parsed.expires_in === "number" ? parsed.expires_in : 3600;

  if (!accessToken) {
    throw new Error("IAM token response missing access_token");
  }

  tokenCache = {
    apiKey: trimmedKey,
    accessToken,
    expiresAtMs: now + expiresInSec * 1000,
  };

  return accessToken;
}

// Made with Bob
