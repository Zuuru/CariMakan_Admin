import * as admin from 'firebase-admin';

let serviceAccount: admin.ServiceAccount | undefined;

try {
  // Load local file for development (will be ignored by Git)
  serviceAccount = require('../../setupdb/serviceAccountKey.json') as admin.ServiceAccount;
} catch (error) {
  // Fallback to environment variables in production / deployments
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn(
      'Firebase Admin SDK could not be initialized: setupdb/serviceAccountKey.json is missing and environment variables are not set.'
    );
  }
}

const adminDb = admin.firestore();

export { adminDb, admin };
