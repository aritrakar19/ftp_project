import admin from './config/firebaseSetup.js';

async function test() {
  try {
    console.log("Firebase initialized:", admin.app().name);
    // Cannot easily test verifyIdToken without a real token, but we can check if admin.auth() throws
    const auth = admin.auth();
    console.log("Auth available");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
