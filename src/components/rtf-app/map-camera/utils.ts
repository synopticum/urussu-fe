// Keep the whole viewport inside the padded bounds; if the viewport is
// wider/taller than the bounds (zoomed out), pin it to the bounds center
import { Bounds } from './types';
import { MathUtils, OrthographicCamera } from 'three';
import { PADDING } from './constants';

export const clampToBounds = (camera: OrthographicCamera, bounds: Bounds) => {
    const halfW = ((camera.right - camera.left) / camera.zoom) * 0.5;
    const halfH = ((camera.top - camera.bottom) / camera.zoom) * 0.5;
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const padW = ((bounds.maxX - bounds.minX) * PADDING) / 2;
    const padH = ((bounds.maxY - bounds.minY) * PADDING) / 2;
    camera.position.x = padW > halfW ? MathUtils.clamp(camera.position.x, cx - padW + halfW, cx + padW - halfW) : cx;
    camera.position.y = padH > halfH ? MathUtils.clamp(camera.position.y, cy - padH + halfH, cy + padH - halfH) : cy;
};
