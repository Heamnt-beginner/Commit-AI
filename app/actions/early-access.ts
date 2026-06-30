'use server';

import { db } from '@/lib/firebase-admin';

export async function submitEarlyAccess(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !email.endsWith('@gmail.com')) {
    return { success: false, message: 'Invalid email format. Please use a @gmail.com address.' };
  }

  if (!db) {
    return { success: false, message: 'Database is not configured.' };
  }

  try {
    const earlyAccessRef = db.collection('early_access');
    const querySnapshot = await earlyAccessRef.where('email', '==', email).get();

    if (!querySnapshot.empty) {
      return { success: false, message: 'You are already registered.' };
    }

    await earlyAccessRef.add({
      email,
      createdAt: new Date().toISOString()
    });

    return { success: true, message: 'Successfully registered for early access!' };
  } catch (error) {
    console.error('Error submitting early access:', error);
    return { success: false, message: 'An error occurred. Please try again later.' };
  }
}
