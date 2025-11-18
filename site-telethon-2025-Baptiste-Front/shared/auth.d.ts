// auth.d.ts
declare module '#auth-utils' {
  interface User {
    prenom: string;
    nom: string;
    couleur_equipe: string;
    points: number;
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }

}

export {}