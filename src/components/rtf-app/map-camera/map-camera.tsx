import * as React from 'react';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MathUtils, OrthographicCamera, Vector3 } from 'three';
import { RtfMapCameraProps } from './types';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, PADDING, ZOOM_SPEED } from './constants';
import { clampToBounds } from './utils';

export const MapCamera: React.FC<RtfMapCameraProps> = ({ bounds }) => {
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
        camera.zoom = DEFAULT_ZOOM;
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

            // Zooming toward the cursor can push the viewport past the map
            // edges; clamp it the same way dragging does
            if (bounds) {
                clampToBounds(camera, bounds);
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [gl, camera, bounds]);

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

            clampToBounds(camera, bounds);
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
};
