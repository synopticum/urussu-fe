import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MathUtils, OrthographicCamera, Vector3 } from 'three';

export interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

const PADDING = 1.05;
const MIN_ZOOM = 1;
const MAX_ZOOM = 100;
const ZOOM_SPEED = 1.0015;

export function MapCamera({ bounds }: { bounds: Bounds | null }) {
    const size = useThree((state) => state.size);
    const camera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);

    // Fit the data bounds into the viewport with a uniform scale on both axes
    useEffect(() => {
        if (!bounds || !(camera instanceof OrthographicCamera)) return;

        // Take ownership of the projection so R3F's resize handler doesn't reset the frustum
        camera.manual = true;

        const worldW = (bounds.maxX - bounds.minX) * PADDING;
        const worldH = (bounds.maxY - bounds.minY) * PADDING;
        const scale = Math.min(size.width / worldW, size.height / worldH);

        const halfW = size.width / scale / 2;
        const halfH = size.height / scale / 2;

        camera.position.set((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2, 1);
        camera.left = -halfW;
        camera.right = halfW;
        camera.top = halfH;
        camera.bottom = -halfH;
        camera.updateProjectionMatrix();
    }, [bounds, size, camera]);

    // Wheel zoom toward the cursor, clamped to [MIN_ZOOM, MAX_ZOOM]
    useEffect(() => {
        const el = gl.domElement;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (!(camera instanceof OrthographicCamera)) return;

            const next = MathUtils.clamp(camera.zoom * Math.pow(ZOOM_SPEED, -e.deltaY), MIN_ZOOM, MAX_ZOOM);
            if (next === camera.zoom) return;

            // Keep the world point under the cursor stationary while zooming
            const ndc = new Vector3((e.offsetX / el.clientWidth) * 2 - 1, -(e.offsetY / el.clientHeight) * 2 + 1, 0);
            const before = ndc.clone().unproject(camera);

            camera.zoom = next;
            camera.updateProjectionMatrix();

            const after = ndc.clone().unproject(camera);
            camera.position.add(before.sub(after));
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [gl, camera]);

    // Drag to pan: move the camera opposite the pointer, converting pixels to world units.
    // The visible area is clamped to the padded bounds so you can't drag the map off-screen.
    useEffect(() => {
        const el = gl.domElement;
        let lastX = 0;
        let lastY = 0;

        const onPointerDown = (e: PointerEvent) => {
            if (e.button !== 0) return;
            lastX = e.clientX;
            lastY = e.clientY;
            el.setPointerCapture(e.pointerId);
            el.style.cursor = 'grabbing';
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!(camera instanceof OrthographicCamera) || !bounds || !el.hasPointerCapture(e.pointerId)) return;

            const worldPerPixel = (camera.right - camera.left) / camera.zoom / el.clientWidth;
            camera.position.x -= (e.clientX - lastX) * worldPerPixel;
            camera.position.y += (e.clientY - lastY) * worldPerPixel;
            lastX = e.clientX;
            lastY = e.clientY;

            // Keep the whole viewport inside the padded bounds; if the viewport is
            // wider/taller than the bounds (zoomed out), pin it to the bounds center
            const halfW = ((camera.right - camera.left) / camera.zoom) * 0.5;
            const halfH = ((camera.top - camera.bottom) / camera.zoom) * 0.5;
            const cx = (bounds.minX + bounds.maxX) / 2;
            const cy = (bounds.minY + bounds.maxY) / 2;
            const padW = ((bounds.maxX - bounds.minX) * PADDING) / 2;
            const padH = ((bounds.maxY - bounds.minY) * PADDING) / 2;
            camera.position.x = padW > halfW ? MathUtils.clamp(camera.position.x, cx - padW + halfW, cx + padW - halfW) : cx;
            camera.position.y = padH > halfH ? MathUtils.clamp(camera.position.y, cy - padH + halfH, cy + padH - halfH) : cy;
        };

        const onPointerUp = (e: PointerEvent) => {
            if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
            el.style.cursor = '';
        };

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerup', onPointerUp);
        };
    }, [gl, camera, bounds]);

    return null;
}
