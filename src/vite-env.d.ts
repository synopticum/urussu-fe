/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly API_URL: string;
    readonly API_OBJECT_STORAGE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
