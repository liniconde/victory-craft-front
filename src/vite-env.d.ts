/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OAUTH2_GOOGLE_URL?: string;
  readonly VITE_OAUTH2_CALLBACK_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
