import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

export default admin;
