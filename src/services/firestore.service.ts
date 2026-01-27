import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  PomodoroSession,
  MoodEntry,
  AISuggestion,
  UserPreferences,
  UserStatistics,
  FirestorePomodoroSession,
} from "../types";

class FirestoreService {
  /**
   * Salvar sessão Pomodoro concluída
   */
  async savePomodoroSession(
    session: Omit<PomodoroSession, "id">,
  ): Promise<string> {
    try {
      console.log(
        "FirestoreService: Iniciando savePomodoroSession...",
        session,
      );

      const firestoreSession: FirestorePomodoroSession = {
        ...session,
        completedAt: Timestamp.fromDate(session.completedAt),
      };
      console.log("FirestoreService: Objeto preparado, chamando addDoc...");

      // Criar promise com timeout de 10 segundos
      const addDocPromise = addDoc(
        collection(db, "pomodoro_sessions"),
        firestoreSession,
      );
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Timeout: addDoc demorou mais de 10 segundos")),
          10000,
        ),
      );

      const docRef = await Promise.race([addDocPromise, timeoutPromise]);
      console.log("FirestoreService: addDoc concluído! ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("FirestoreService: ERRO ao salvar sessão:", error);
      console.error("FirestoreService: Detalhes:", {
        message: error.message,
        code: error.code,
        name: error.name,
      });

      // Se for timeout ou erro de permissão, dar instrução clara
      if (
        error.message?.includes("Timeout") ||
        error.code === "permission-denied"
      ) {
        console.error(
          "FirestoreService: ⚠️ POSSÍVEL PROBLEMA DE REGRAS DE SEGURANÇA!",
        );
        console.error(
          "FirestoreService: Verifique as regras do Firestore no Firebase Console",
        );
      }

      throw error;
    }
  }

  /**
   * Buscar sessões do usuário
   */
  async getUserSessions(
    userId: string,
    limitCount: number = 50,
  ): Promise<PomodoroSession[]> {
    try {
      const q = query(
        collection(db, "pomodoro_sessions"),
        where("userId", "==", userId),
        orderBy("completedAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data() as FirestorePomodoroSession;
        return {
          id: doc.id,
          ...data,
          completedAt: data.completedAt.toDate(),
        };
      });
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
      return [];
    }
  }

  /**
   * Salvar entrada de humor
   */
  async saveMoodEntry(mood: Omit<MoodEntry, "id">): Promise<string> {
    try {
      const moodRef = doc(collection(db, "mood_entries"));
      await setDoc(moodRef, {
        ...mood,
        timestamp: Timestamp.fromDate(mood.timestamp),
      });
      return moodRef.id;
    } catch (error) {
      console.error("Erro ao salvar humor:", error);
      throw new Error("Não foi possível salvar a entrada de humor");
    }
  }

  /**
   * Buscar entradas de humor do usuário
   */
  async getUserMoodEntries(
    userId: string,
    limitCount: number = 30,
  ): Promise<MoodEntry[]> {
    try {
      const q = query(
        collection(db, "mood_entries"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as MoodEntry;
      });
    } catch (error) {
      console.error("Erro ao buscar entradas de humor:", error);
      return [];
    }
  }

  /**
   * Salvar sugestão de IA
   */
  async saveAISuggestion(
    suggestion: Omit<AISuggestion, "id">,
  ): Promise<string> {
    try {
      const suggestionRef = doc(collection(db, "ai_suggestions"));
      await setDoc(suggestionRef, {
        ...suggestion,
        createdAt: Timestamp.fromDate(suggestion.createdAt),
        suggestedTime: suggestion.suggestedTime
          ? Timestamp.fromDate(suggestion.suggestedTime)
          : null,
      });
      return suggestionRef.id;
    } catch (error) {
      console.error("Erro ao salvar sugestão:", error);
      throw new Error("Não foi possível salvar a sugestão");
    }
  }

  /**
   * Buscar sugestões de IA ativas
   */
  async getActiveSuggestions(userId: string): Promise<AISuggestion[]> {
    try {
      const q = query(
        collection(db, "ai_suggestions"),
        where("userId", "==", userId),
        where("dismissed", "==", false),
        orderBy("createdAt", "desc"),
        limit(5),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          suggestedTime: data.suggestedTime
            ? data.suggestedTime.toDate()
            : undefined,
        } as AISuggestion;
      });
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      return [];
    }
  }

  /**
   * Atualizar preferências do usuário
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      // Usar setDoc com merge para criar se não existir
      await setDoc(
        userRef,
        {
          preferences: preferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      throw new Error("Não foi possível atualizar as preferências");
    }
  }

  /**
   * Atualizar perfil do usuário (nome, etc)
   */
  async updateUserProfile(
    userId: string,
    profileData: { displayName?: string; photoURL?: string },
  ): Promise<void> {
    try {
      // Importar auth e updateProfile do Firebase
      const { auth } = await import("../firebase/config");
      const { updateProfile } = await import("firebase/auth");

      // Atualizar no Firebase Auth
      if (auth.currentUser && profileData.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
        });
        console.log("Firebase Auth atualizado com sucesso");
      }

      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      console.log("Firestore atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw new Error("Não foi possível atualizar o perfil");
    }
  }

  /**
   * Atualizar estatísticas do usuário
   */
  async updateUserStatistics(
    userId: string,
    statistics: Partial<UserStatistics>,
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        statistics: statistics,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
      throw new Error("Não foi possível atualizar as estatísticas");
    }
  }

  /**
   * Descartar sugestão de IA
   */
  async dismissSuggestion(suggestionId: string): Promise<void> {
    try {
      const suggestionRef = doc(db, "ai_suggestions", suggestionId);
      await updateDoc(suggestionRef, {
        dismissed: true,
        dismissedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao descartar sugestão:", error);
      throw new Error("Não foi possível descartar a sugestão");
    }
  }

  /**
   * Aceitar sugestão de IA
   */
  async acceptSuggestion(suggestionId: string): Promise<void> {
    try {
      const suggestionRef = doc(db, "ai_suggestions", suggestionId);
      await updateDoc(suggestionRef, {
        accepted: true,
        acceptedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao aceitar sugestão:", error);
      throw new Error("Não foi possível aceitar a sugestão");
    }
  }
}

export default new FirestoreService();
