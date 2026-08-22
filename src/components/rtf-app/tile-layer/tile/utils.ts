import { getStaticUrl } from '@/utils/get-static-url';

export const getTileUrl = (z: number, x: number, y: number) => getStaticUrl(`/tiles/${z}/${x}/${y}.png`);