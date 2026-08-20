import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { MathUtils, OrthographicCamera, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector2, Vector3 } from 'three';

// Tiles are standard XYZ (slippy-map) 256px PNGs, zoom levels 4..6, generated
// from a 10000x6250 px source image unprojected at zoom 6 (see the old Leaflet
// MapStore). World units match App.tsx: x = longitude, y = mercator in degrees,
// so the full world spans [-180, 180] on both axes and tile math is closed-form.
import { reveal, REVEAL_RADIUS, type RevealUniforms } from '../constants';
import { MAX_ZOOM, MIN_ZOOM } from '../map-camera/constants';
import { Tile } from './tile';
import { TileWindow } from './types';
import { MAX_Z, MIN_Z, TILE_SIZE } from './constants';
import { cols, isSameWindow, rows } from './utils';

export const TileLayer = () => {
    const gl = useThree((state) => state.gl);
    const [window_, setWindow] = useState<TileWindow | null>(null);

    // Latest pointer position in NDC; converted to world coordinates every
    // frame so the circle stays under the cursor while panning and zooming.
    // While a drag is in progress the reveal circle is hidden entirely.
    const pointer = useRef({ ndc: new Vector2(), active: false, dragging: false });

    // World-per-pixel at the initial camera fit; the reveal radius is kept
    // constant on screen by scaling it with the current ratio to this value.
    const initialWorldPerPixel = useRef<number | null>(null);

    useEffect(() => {
        const el = gl.domElement;

        const onPointerMove = (e: PointerEvent) => {
            pointer.current.ndc.set((e.offsetX / el.clientWidth) * 2 - 1, -(e.offsetY / el.clientHeight) * 2 + 1);
            pointer.current.active = true;
        };
        const onPointerLeave = () => {
            pointer.current.active = false;
        };
        // Same button-0 drag that MapCamera pans with (src/MapCamera.tsx)
        const onPointerDown = (e: PointerEvent) => {
            if (e.button === 0) pointer.current.dragging = true;
        };
        const onPointerUp = () => {
            pointer.current.dragging = false;
        };

        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerleave', onPointerLeave);
        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointercancel', onPointerUp);
        return () => {
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerleave', onPointerLeave);
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointerup', onPointerUp);
            el.removeEventListener('pointercancel', onPointerUp);
        };
    }, [gl]);

    // Recompute the visible tile window from the camera; update state only when
    // the window actually changes so panning doesn't re-render every frame.
    useFrame(({ camera, size }) => {
        if (!(camera instanceof OrthographicCamera)) return;

        if (pointer.current.active && !pointer.current.dragging) {
            const world = new Vector3(pointer.current.ndc.x, pointer.current.ndc.y, 0).unproject(camera);
            reveal.uMouse.value.set(world.x, world.y);
        } else {
            reveal.uMouse.value.set(1e9, 1e9);
        }

        const halfW = (camera.right - camera.left) / camera.zoom / 2;
        const halfH = (camera.top - camera.bottom) / camera.zoom / 2;

        // REVEAL_RADIUS is in world units as seen at the initial fit, so
        // scaling it by worldPerPixel/initialWorldPerPixel would keep the
        // circle at a constant screen size. Instead it also scales with
        // camera.zoom: full size at MAX_ZOOM, 0.375 of it at MIN_ZOOM,
        // lerped in between. The initial value is captured only after
        // MapCamera has taken ownership of the projection (camera.manual).
        const worldPerPixel = (halfH * 2) / size.height;
        reveal.uPixel.value = worldPerPixel;
        if (initialWorldPerPixel.current == null && (camera as { manual?: boolean }).manual) {
            initialWorldPerPixel.current = worldPerPixel;
        }
        if (initialWorldPerPixel.current != null) {
            const zoomT = (camera.zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM);
            const zoomScale = MathUtils.lerp((MIN_ZOOM * 1.5) / MAX_ZOOM, 1, zoomT);
            reveal.uRadius.value = ((REVEAL_RADIUS * worldPerPixel) / initialWorldPerPixel.current) * zoomScale;
        }

        const minX = camera.position.x - halfW;
        const maxX = camera.position.x + halfW;
        const minY = camera.position.y - halfH;
        const maxY = camera.position.y + halfH;

        // Pick the tile zoom closest to the current screen resolution:
        // at zoom z the world is 256*2^z px wide, i.e. 256*2^z/360 px per degree.
        const pxPerDeg = size.height / (halfH * 2);
        const z = MathUtils.clamp(Math.round(Math.log2((pxPerDeg * 360) / TILE_SIZE)), MIN_Z, MAX_Z);

        const s = 360 / 2 ** z;
        const next: TileWindow = {
            z,
            x0: MathUtils.clamp(Math.floor((minX + 180) / s), 0, cols(z) - 1),
            x1: MathUtils.clamp(Math.floor((maxX + 180) / s), 0, cols(z) - 1),
            y0: MathUtils.clamp(Math.floor((180 - maxY) / s), 0, rows(z) - 1),
            y1: MathUtils.clamp(Math.floor((180 - minY) / s), 0, rows(z) - 1),
        };

        if (!isSameWindow(window_, next)) setWindow(next);
    });

    const tiles = useMemo(() => {
        if (!window_) return [];
        const result: [number, number][] = [];
        for (let x = window_.x0; x <= window_.x1; x++) {
            for (let y = window_.y0; y <= window_.y1; y++) {
                result.push([x, y]);
            }
        }
        return result;
    }, [window_]);

    if (!window_) return null;

    return (
        <>
            {tiles.map(([x, y]) => (
                <Tile key={`${window_.z}/${x}/${y}`} z={window_.z} x={x} y={y} reveal={reveal} />
            ))}
        </>
    );
}
