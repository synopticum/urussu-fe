// Only tiles inside the source image exist on disk; anything outside 404s.
import { MAX_Z, TILE_SIZE } from './constants';
import { TileWindow } from './types';

export const cols = (z: number) => Math.ceil((10000 / TILE_SIZE) * 2 ** (z - MAX_Z));
export const rows = (z: number) => Math.ceil((6250 / TILE_SIZE) * 2 ** (z - MAX_Z));

export const isSameWindow = (a: TileWindow | null, b: TileWindow): boolean => {
    return a != null && a.z === b.z && a.x0 === b.x0 && a.x1 === b.x1 && a.y0 === b.y0 && a.y1 === b.y1;
};
