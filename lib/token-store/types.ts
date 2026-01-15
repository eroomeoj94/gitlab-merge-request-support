export type StoredToken = {
  encryptedToken: string;
  expiresAt: number;
};

export type TokenStore = {
  store: (sessionId: string, token: string) => Promise<void>;
  get: (sessionId: string) => Promise<string | null>;
  delete: (sessionId: string) => Promise<void>;
};
