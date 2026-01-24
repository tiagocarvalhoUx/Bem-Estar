import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";
import authService from "../services/auth.service";
import { AuthContextType, UserProfile } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Processar resultado do redirect (login com Google)
    const checkRedirect = async () => {
      try {
        await authService.handleRedirectResult();
      } catch (error) {
        console.error("Erro ao processar redirect:", error);
      }
    };

    checkRedirect();

    // Observar mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        console.log(
          "AuthContext: onAuthStateChanged chamado, usuário:",
          firebaseUser ? firebaseUser.email : "null",
        );

        if (firebaseUser) {
          // Criar perfil básico IMEDIATAMENTE para navegação rápida
          const basicProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "Usuário",
            photoURL: firebaseUser.photoURL || null,
            createdAt: new Date(),
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
          };

          setUser(basicProfile);
          setLoading(false);
          console.log(
            "AuthContext: Perfil básico setado imediatamente:",
            basicProfile.email,
          );

          // Buscar dados completos do Firestore em background (sem bloquear)
          try {
            const userData = await authService.getUserData(firebaseUser.uid);

            if (userData) {
              // Atualizar com dados completos do Firestore
              const fullProfile: UserProfile = {
                id: firebaseUser.uid,
                email: firebaseUser.email || userData?.email || "",
                displayName:
                  firebaseUser.displayName ||
                  userData?.displayName ||
                  "Usuário",
                photoURL: firebaseUser.photoURL || userData?.photoURL || null,
                createdAt: userData?.createdAt?.toDate() || new Date(),
                preferences: userData?.preferences || basicProfile.preferences,
                statistics: userData?.statistics || basicProfile.statistics,
              };

              setUser(fullProfile);
              console.log(
                "AuthContext: Dados completos do Firestore carregados:",
                fullProfile.email,
              );
            }
          } catch (error) {
            console.error(
              "Erro ao buscar dados do Firestore (mantendo perfil básico):",
              error,
            );
            // Usuário já está setado com perfil básico, não precisa fazer nada
          }
        } else {
          console.log(
            "AuthContext: Nenhum usuário autenticado, setando user como null",
          );
          setUser(null);
          setLoading(false);
        }
        console.log("AuthContext: Loading finalizado");
      },
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      await authService.signUp(email, password, displayName);
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext: Iniciando logout...");
      await authService.signOut();
      console.log("AuthContext: Logout concluído com sucesso");
      // Força a limpeza do estado local
      setUser(null);
    } catch (error: any) {
      console.error("AuthContext: Erro ao fazer logout:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
