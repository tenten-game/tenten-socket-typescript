import { getFirestore } from 'firebase-admin/firestore';
import { sendWebHook } from './webhook';

export const saveLogToFirestore = async (
  collectionId: string,
  documentId: string,
  message: any,
) => {
  const db = getFirestore();
  message.timestamp = new Date();
  try {
    await db
      .collection(collectionId)
      .doc(documentId)
      .set(
        { ...message },
      );
  } catch (e) {
    sendWebHook(`Error occurred while saving log to Firestore: ${e} ${message}`);
  }
};
