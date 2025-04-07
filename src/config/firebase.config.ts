import admin from "firebase-admin";

export function initializeFirebase() {
  const serviceAccount = require('../../firebase_admin_key.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}