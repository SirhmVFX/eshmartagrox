import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function initAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps().find((a) => a.name === "eshmartagrox-storefront");
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey && projectId) {
    adminApp = initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey }) },
      "eshmartagrox-storefront"
    );
  } else {
    throw new Error(
      "Firebase Admin not configured. Set FIREBASE_ADMIN_* env vars."
    );
  }

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(initAdminApp());
}
