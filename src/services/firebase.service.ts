import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: any;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }

  async saveMessage(sessionId: string, userMessage: string, botResponse: string, timestamp: Date) {
    try {
      await addDoc(collection(this.db, 'conversations'), {
        sessionId,
        userMessage,
        botResponse,
        timestamp: Timestamp.fromDate(timestamp)
      });
    } catch (error) {
      console.error('Erreur sauvegarde message:', error);
    }
  }

  async getConversationHistory(sessionId: string) {
    try {
      const q = query(collection(this.db, 'conversations'), where('sessionId', '==', sessionId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        userMessage: doc.data()['userMessage'],
        botResponse: doc.data()['botResponse'],
        timestamp: doc.data()['timestamp']?.toDate()
      }));
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }
}