import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { Platform } from "react-native";

class AuthService {
  /**
   * Faz login com email e senha
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Alternativa: signIn (alias para login)
   */
  async signIn(email: string, password: string): Promise<User> {
    return this.login(email, password);
  }

  /**
   * Registra um novo usuário
   */
  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<User> {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Atualizar perfil com o nome
      await updateProfile(user, { displayName });

      // Criar documento do usuário no Firestore
      await this.createUserDocument(user.uid, {
        email,
        displayName,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        preferences: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsUntilLongBreak: 4,
          enableNotifications: true,
          enableSounds: true,
          enableHaptics: true,
        },
        statistics: {
          totalSessions: 0,
          totalFocusTime: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });

      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Alternativa: signUp (alias para register)
   */
  async signUp(
    email: string,
    password: string,
    displayName: string,
  ): Promise<User> {
    return this.register(email, password, displayName);
  }

  /**
   * Login com Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      // Configurações adicionais para evitar problemas de CORS
      provider.setCustomParameters({
        prompt: "select_account",
      });

      let userCredential;

      if (Platform.OS === "web") {
        try {
          // Tentar popup primeiro
          userCredential = await signInWithPopup(auth, provider);
        } catch (popupError: any) {
          // Se popup falhar (bloqueado ou CORS), tentar redirect
          if (
            popupError.code === "auth/popup-blocked" ||
            popupError.code === "auth/cancelled-popup-request" ||
            popupError.message?.includes("CORS") ||
            popupError.message?.includes("popup")
          ) {
            console.log("Popup bloqueado, usando redirect...");
            await signInWithRedirect(auth, provider);
            // O redirect vai recarregar a página, então não continua daqui
            return null as any;
          }
          throw popupError;
        }
      } else {
        // No mobile, usar redirect
        await signInWithRedirect(auth, provider);
        userCredential = await getRedirectResult(auth);

        if (!userCredential) {
          throw new Error("Login cancelado");
        }
      }

      const user = userCredential.user;

      // Verificar se é novo usuário e criar documento (com retry)
      try {
        const userDoc = await this.getUserData(user.uid);
        if (!userDoc) {
          await this.createUserDocument(user.uid, {
            email: user.email || "",
            displayName: user.displayName || "Usuário",
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            preferences: {
              workDuration: 25,
              shortBreakDuration: 5,
              longBreakDuration: 15,
              sessionsUntilLongBreak: 4,
              enableNotifications: true,
              enableSounds: true,
              enableHaptics: true,
            },
            statistics: {
              totalSessions: 0,
              totalFocusTime: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
          });
        }
      } catch (firestoreError) {
        // Se Firestore falhar, apenas loga mas continua o login
        console.warn(
          "Erro ao criar/buscar documento do usuário:",
          firestoreError,
        );
        // O usuário ainda pode usar o app, os dados serão criados depois
      }

      return user;
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Login cancelado pelo usuário");
      }
      if (error.code === "auth/cancelled-popup-request") {
        throw new Error("Login cancelado");
      }
      throw this.handleAuthError(error);
    }
  }

  /**
   * Processar resultado do redirect (chamar no App.tsx)
   */
  async handleRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;

        // Criar documento se necessário
        try {
          const userDoc = await this.getUserData(user.uid);
          if (!userDoc) {
            await this.createUserDocument(user.uid, {
              email: user.email || "",
              displayName: user.displayName || "Usuário",
              photoURL: user.photoURL || null,
              createdAt: serverTimestamp(),
              preferences: {
                workDuration: 25,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                sessionsUntilLongBreak: 4,
                enableNotifications: true,
                enableSounds: true,
                enableHaptics: true,
              },
              statistics: {
                totalSessions: 0,
                totalFocusTime: 0,
                currentStreak: 0,
                longestStreak: 0,
              },
            });
          }
        } catch (firestoreError) {
          console.warn(
            "Erro ao criar documento após redirect:",
            firestoreError,
          );
        }

        return user;
      }
      return null;
    } catch (error) {
      console.error("Erro ao processar redirect:", error);
      return null;
    }
  }

  /**
   * Faz logout
   */
  async logout(): Promise<void> {
    try {
      console.log("AuthService: Fazendo logout do Firebase...");
      await firebaseSignOut(auth);
      console.log("AuthService: Logout do Firebase concluído");
    } catch (error: any) {
      console.error("AuthService: Erro ao fazer logout:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Alternativa: signOut (alias para logout)
   */
  async signOut(): Promise<void> {
    return this.logout();
  }

  /**
   * Envia email de recuperação de senha
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url:
          Platform.OS === "web"
            ? window.location.origin + "/login"
            : "pomodoroai://login",
        handleCodeInApp: false,
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Busca dados do usuário no Firestore
   */
  async getUserData(userId: string): Promise<any> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error: any) {
      // Se for erro de offline, retorna null mas não falha
      if (error.code === "unavailable" || error.message?.includes("offline")) {
        console.warn("Firestore offline, retornando null");
        return null;
      }
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
    }
  }

  /**
   * Cria documento do usuário no Firestore
   */
  private async createUserDocument(userId: string, data: any): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      // Se for erro de offline, loga mas não falha
      if (error.code === "unavailable" || error.message?.includes("offline")) {
        console.warn(
          "Firestore offline, documento será criado quando voltar online",
        );
        return;
      }
      console.error("Erro ao criar documento do usuário:", error);
      throw new Error("Não foi possível criar perfil do usuário");
    }
  }

  /**
   * Trata erros do Firebase Auth e retorna mensagens amigáveis
   */
  private handleAuthError(error: any): Error {
    let message = "Ocorreu um erro. Tente novamente.";

    console.error("Auth Error:", error.code, error.message);

    switch (error.code) {
      case "auth/user-not-found":
        message = "Usuário não encontrado";
        break;
      case "auth/wrong-password":
        message = "Senha incorreta";
        break;
      case "auth/email-already-in-use":
        message = "Este email já está em uso";
        break;
      case "auth/invalid-email":
        message = "Email inválido";
        break;
      case "auth/weak-password":
        message = "A senha deve ter pelo menos 6 caracteres";
        break;
      case "auth/too-many-requests":
        message = "Muitas tentativas. Tente novamente mais tarde";
        break;
      case "auth/network-request-failed":
        message = "Erro de conexão. Verifique sua internet";
        break;
      case "auth/user-disabled":
        message = "Esta conta foi desabilitada";
        break;
      case "auth/operation-not-allowed":
        message = "Operação não permitida";
        break;
      case "auth/invalid-credential":
        message = "Credenciais inválidas. Verifique email e senha";
        break;
      case "auth/popup-blocked":
        message = "Pop-up bloqueado. Permita pop-ups para fazer login";
        break;
      case "auth/popup-closed-by-user":
        message = "Login cancelado";
        break;
      case "auth/cancelled-popup-request":
        message = "Apenas uma janela de login por vez";
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

export default new AuthService();
