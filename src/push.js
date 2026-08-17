/**
 * FullRemote-Jobs - Service Web Push Notifications (Standard W3C / VAPID)
 */

export const DEFAULT_VAPID_PUBLIC_KEY =
  "BATI0xxF0RJt2-nCL0kUM_J0z1rF5xRYjE_X0uuVMmyiXUMEgD2HMBIBJVwQNV07uMsbrXTllpI1KvIt0VTDSIQ";
export const DEFAULT_VAPID_PRIVATE_KEY = "B5v1MWPtCgT1jjvfwsCtpu5ZZrsIuvOmKz6_qAtCsCM";
export const DEFAULT_VAPID_SUBJECT = "mailto:contact@edounze.com";

/**
 * Convertit une chaîne Base64URL en Uint8Array
 */
export function base64UrlToUint8Array(base64Url) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convertit un ArrayBuffer/Uint8Array en Base64URL
 */
export function uint8ArrayToBase64Url(uint8Array) {
  let binary = "";
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Crée un jeton JWT VAPID signé avec ECDSA P-256 (ES256) via Web Crypto
 */
export async function createVapidJwt(
  audience,
  subject = DEFAULT_VAPID_SUBJECT,
  privateKeyB64 = DEFAULT_VAPID_PRIVATE_KEY,
  publicKeyB64 = DEFAULT_VAPID_PUBLIC_KEY
) {
  const { subtle } = crypto.webcrypto || crypto;

  const rawPrivate = base64UrlToUint8Array(privateKeyB64);
  const rawPublic = base64UrlToUint8Array(publicKeyB64);

  // Découpage coordonnées X et Y de la clé publique non compressée (65 octets)
  const x = uint8ArrayToBase64Url(rawPublic.slice(1, 33));
  const y = uint8ArrayToBase64Url(rawPublic.slice(33, 65));
  const d = uint8ArrayToBase64Url(rawPrivate);

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x,
    y,
    d,
  };

  const key = await subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, [
    "sign",
  ]);

  const header = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  );
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600; // 12 heures
  const claims = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify({ aud: audience, exp, sub: subject }))
  );

  const data = new TextEncoder().encode(`${header}.${claims}`);
  const signatureBuffer = await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, data);
  const signature = uint8ArrayToBase64Url(new Uint8Array(signatureBuffer));

  return `${header}.${claims}.${signature}`;
}

/**
 * Envoie une notification Web Push à un abonnement
 */
export async function sendWebPushNotification({
  subscription,
  payload = {},
  vapidPublicKey = DEFAULT_VAPID_PUBLIC_KEY,
  vapidPrivateKey = DEFAULT_VAPID_PRIVATE_KEY,
  vapidSubject = DEFAULT_VAPID_SUBJECT,
}) {
  if (!subscription || !subscription.endpoint) {
    return { success: false, error: "Subscription endpoint invalide" };
  }

  try {
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

    const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey, vapidPublicKey);

    const headers = {
      TTL: "86400",
      Urgency: "normal",
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    };

    let body = null;
    if (payload) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload);
    }

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body,
    });

    if (response.status === 201 || response.status === 200 || response.status === 202) {
      return { success: true, status: response.status };
    }

    if (response.status === 404 || response.status === 410) {
      // Abonnement expiré / supprimé
      return { success: false, expired: true, status: response.status };
    }

    const errText = await response.text();
    return { success: false, status: response.status, error: errText };
  } catch (err) {
    console.error("[PUSH] Erreur lors de l'envoi Push :", err);
    return { success: false, error: err.message };
  }
}
