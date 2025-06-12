import { getFirestore } from 'firebase-admin/firestore';
import { sendGoogleChatMessage } from './webhook';

export const saveLogToFirestore = async (
  collectionId: string,
  documentId: string,
  message: any,
) => {
  const db = getFirestore();
  message.timestamp = Date.now();
  try {
    await db
      .collection(collectionId)
      .doc(documentId)
      .set(
        { ...message },
      );
  } catch (e) {
    sendGoogleChatMessage(`Error occurred while saving log to Firestore: ${e} ${message}`);
  }
};
