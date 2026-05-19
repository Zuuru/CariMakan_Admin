const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

const localKeyPath = path.join(__dirname, '../setupdb/serviceAccountKey.json');

if (fs.existsSync(localKeyPath)) {
  try {
    serviceAccount = require(localKeyPath);
    console.log('Firebase Admin: Loaded serviceAccountKey.json from setupdb');
  } catch (err) {
    console.error('Firebase Admin: Failed to load serviceAccountKey.json from setupdb', err);
  }
}

if (!serviceAccount && process.env.FIREBASE_PROJECT_ID) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  };
  console.log('Firebase Admin: Using environment variables');
}

if (!admin.apps.length) {
  const hasServiceAccount = serviceAccount && (serviceAccount.project_id || serviceAccount.projectId);
  if (hasServiceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin: Initialized successfully');
  } else {
    console.warn(
      'Firebase Admin: Could not be initialized. Missing serviceAccountKey.json or environment variables.'
    );
  }
}

const db = admin.firestore();

module.exports = {
  db,
  admin,
};
