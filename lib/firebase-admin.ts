// Initialize Firebase Admin if not already initialized
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any = null;

if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const filePath = path.join(process.cwd(), 'config', 'serviceAccountKey.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    dbInstance = admin.firestore();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = dbInstance;
