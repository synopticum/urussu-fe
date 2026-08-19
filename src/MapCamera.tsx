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

    return null;
}
