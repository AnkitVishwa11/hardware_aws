/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_POLL_INTERVAL_MS: string;
  readonly VITE_STALE_TIMEOUT_SEC: string;
  readonly VITE_DEFAULT_ROVER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
