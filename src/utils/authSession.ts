export const AUTH_INVALIDATED_EVENT = "auth:session-invalidated";

const AUTH_STORAGE_KEYS = [
  "token",
  "userId",
  "email",
  "role",
  "exp",
  "viewRole",
  "firstName",
  "lastName",
] as const;

export const clearPersistedAuthSession = (): void => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const notifyAuthSessionInvalidated = (): void => {
  window.dispatchEvent(new Event(AUTH_INVALIDATED_EVENT));
};

export const clearPersistedAuthSessionAndNotify = (): void => {
  clearPersistedAuthSession();
  notifyAuthSessionInvalidated();
};
