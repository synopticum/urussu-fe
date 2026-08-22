// Base URL for static cloud storage (tiles, photos). Configured via .env,
// e.g. API_OBJECT_STORAGE_URL=https://storage.yandexcloud.net/urussu
const BASE_URL = (import.meta.env.API_OBJECT_STORAGE_URL ?? '').replace(/\/+$/, '');

export const getStaticUrl = (path: string) => `${BASE_URL}${path}`;
