import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import {
    MathUtils,
    OrthographicCamera,
    ShaderMaterial,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
} from 'three';

// Tiles are standard XYZ (slippy-map) 256px PNGs, zoom levels 4..6, generated
// from a 10000x6250 px source image unprojected at zoom 6 (see the old Leaflet
// MapStore). World units match App.tsx: x = longitude, y = mercator in degrees,
// so the full world spans [-180, 180] on both axes and tile math is closed-form.
import { reveal, REVEAL_RADIUS, type RevealUniforms } from './reveal';

const MIN_Z = 4;
const MAX_Z = 6;
const TILE_SIZE = 256;

const tileUrl = (z: number, x: number, y: number) => `/images/tiles/${z}/${x}/${y}.png`;

// Only tiles inside the source image exist on disk; anything outside 404s.
const cols = (z: number) => Math.ceil((10000 / TILE_SIZE) * 2 ** (z - MAX_Z));
const rows = (z: number) => Math.ceil((6250 / TILE_SIZE) * 2 ** (z - MAX_Z));

interface TileWindow {
    z: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

function sameWindow(a: TileWindow | null, b: TileWindow): boolean {
    return a != null && a.z === b.z && a.x0 === b.x0 && a.x1 === b.x1 && a.y0 === b.y0 && a.y1 === b.y1;
}

function Tile({ z, x, y, reveal }: { z: number; x: number; y: number; reveal: RevealUniforms }) {
    const texture = useLoader(TextureLoader, tileUrl(z, x, y));

    // Tile (z, x, y) covers: x0 = -180 + x*s .. +s, y from top: 180 - y*s .. -s
    const s = 360 / 2 ** z;

    const material = useMemo(() => {
        texture.colorSpace = SRGBColorSpace;

        // Same base output as meshBasicMaterial with a map, revealed through a
        // round "glass" lens: sharpened + darkened raster inside, slight
        // radial refraction near the rim, and an irregular rim light (crisp
        // specular line + soft glow + cool bounce) instead of a gradient fade.
        // A soft drop shadow hugs the rim outside. All effect widths are in
        // screen pixels (uPixel converts them to world units).
        return new ShaderMaterial({
            uniforms: {
                map: { value: texture },
                uMouse: reveal.uMouse,
                uRadius: reveal.uRadius,
                uPixel: reveal.uPixel,
                uTileSpan: { value: s },
            },
            vertexShader: /* glsl */ `
                varying vec2 vUv;
                varying vec2 vWorldPos;
                void main() {
                    vUv = uv;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPos = worldPos.xy;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: /* glsl */ `
                #define SHARPEN 0.5
                #define BRIGHTNESS 0.9
                #define RIM_PX 18.0
                #define SHADOW_PX 6.0
                #define REFRACT_BAND_PX 60.0
                #define REFRACT_SHIFT_PX 6.0
                uniform sampler2D map;
                uniform vec2 uMouse;
                uniform float uRadius;
                uniform float uPixel;
                uniform float uTileSpan;
                varying vec2 vUv;
                varying vec2 vWorldPos;

                // Unsharp mask: center boosted, 4 neighbors subtracted
                vec3 sampleSharpened(vec2 uv) {
                    vec2 texel = vec2(1.0 / 256.0);
                    vec3 color = texture2D(map, uv).rgb * (1.0 + 4.0 * SHARPEN);
                    color -= texture2D(map, uv + vec2(texel.x, 0.0)).rgb * SHARPEN;
                    color -= texture2D(map, uv - vec2(texel.x, 0.0)).rgb * SHARPEN;
                    color -= texture2D(map, uv + vec2(0.0, texel.y)).rgb * SHARPEN;
                    color -= texture2D(map, uv - vec2(0.0, texel.y)).rgb * SHARPEN;
                    return color;
                }

                float hash(float n) {
                    return fract(sin(n) * 43758.5453123);
                }

                // Periodic value noise on the rim angle: smooth, organically
                // spaced variation without the evenly-spaced spokes that
                // layered sines produce. period must be an integer.
                float pnoise(float x, float period) {
                    float i = floor(x);
                    float f = fract(x);
                    float u = f * f * (3.0 - 2.0 * f);
                    return mix(hash(mod(i, period)), hash(mod(i + 1.0, period)), u);
                }

                void main() {
                    float dist = distance(vWorldPos, uMouse);
                    float edge = dist - uRadius; // > 0 outside the glass

                    if (edge > 0.0) {
                        // Soft drop shadow hugging the rim, like glass on paper
                        float shadow = (1.0 - smoothstep(0.0, SHADOW_PX * uPixel, edge)) * 0.25;
                        if (shadow <= 0.0) discard;
                        gl_FragColor = vec4(vec3(0.0), shadow);
                    } else {
                        vec2 dir = (vWorldPos - uMouse) / max(dist, 1e-4);
                        float rimPx = -edge / uPixel; // pixels inward from the rim

                        // Refraction: near the rim, sample the raster shifted
                        // toward the center, so the image appears to bend
                        // outward under the curved glass edge
                        float bend = 1.0 - smoothstep(0.0, REFRACT_BAND_PX, rimPx);
                        vec2 uv = vUv - dir * (bend * bend) * REFRACT_SHIFT_PX * uPixel / uTileSpan;

                        vec3 color = sampleSharpened(uv) * BRIGHTNESS;

                        // Rim light, lit from the top-left. Low-frequency
                        // periodic noise gently varies the intensity and width
                        // around the circle, so the rim reads as real glass
                        // rather than a generated gradient
                        float angle = atan(dir.y, dir.x);
                        float turns = angle / 6.2831853 + 0.5; // [-pi, pi] -> [0, 1]
                        float noise = 0.85
                            + 0.3 * (pnoise(turns * 3.0, 3.0) - 0.5)
                            + 0.15 * (pnoise(turns * 7.0, 7.0) - 0.5);
                        float light = dot(dir, normalize(vec2(-0.6, 0.75)));
                        float lit = pow(clamp(light, 0.0, 1.0), 2.0);
                        float dark = pow(clamp(-light, 0.0, 1.0), 1.5);

                        // Crisp 2px specular line plus a wider soft glow;
                        // both widths breathe a little with the noise
                        float lineMask = 1.0 - smoothstep(0.0, 2.0 * noise, rimPx);
                        float glowMask = 1.0 - smoothstep(0.0, RIM_PX * noise, rimPx);
                        color += lineMask * lit * 0.85 * noise;
                        color += glowMask * lit * 0.3 * noise;
                        // Cool secondary bounce on the shadowed side
                        color += glowMask * pow(clamp(-light, 0.0, 1.0), 3.0) * vec3(0.1, 0.12, 0.16) * noise;
                        color *= 1.0 - glowMask * dark * 0.25;
                        // Faint sheen across the lit half of the glass
                        color += clamp(light, 0.0, 1.0) * 0.04 * noise;

                        float baseAlpha = texture2D(map, uv).a;
                        gl_FragColor = vec4(color, baseAlpha);
                    }
                    #include <colorspace_fragment>
                }
            `,
            transparent: true,
        });
    }, [texture, reveal, s]);

    const cx = -180 + x * s + s / 2;
    const cy = 180 - y * s - s / 2;

    return (
        <mesh position={[cx, cy, -1]} material={material}>
            <planeGeometry args={[s, s]} />
        </mesh>
    );
}

export function TileLayer() {
    const gl = useThree((state) => state.gl);
    const [window_, setWindow] = useState<TileWindow | null>(null);

    // Latest pointer position in NDC; converted to world coordinates every
    // frame so the circle stays under the cursor while panning and zooming.
    const pointer = useRef({ ndc: new Vector2(), active: false });

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

        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerleave', onPointerLeave);
        return () => {
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerleave', onPointerLeave);
        };
    }, [gl]);

    // Recompute the visible tile window from the camera; update state only when
    // the window actually changes so panning doesn't re-render every frame.
    useFrame(({ camera, size }) => {
        if (!(camera instanceof OrthographicCamera)) return;

        if (pointer.current.active) {
            const world = new Vector3(pointer.current.ndc.x, pointer.current.ndc.y, 0).unproject(camera);
            reveal.uMouse.value.set(world.x, world.y);
        } else {
            reveal.uMouse.value.set(1e9, 1e9);
        }

        const halfW = (camera.right - camera.left) / camera.zoom / 2;
        const halfH = (camera.top - camera.bottom) / camera.zoom / 2;

        // Keep the reveal circle fixed on screen: REVEAL_RADIUS is in world
        // units as seen at the initial fit, so scale it by how much the
        // camera has zoomed since. The initial value is captured only after
        // MapCamera has taken ownership of the projection (camera.manual).
        const worldPerPixel = (halfH * 2) / size.height;
        reveal.uPixel.value = worldPerPixel;
        if (initialWorldPerPixel.current == null && (camera as { manual?: boolean }).manual) {
            initialWorldPerPixel.current = worldPerPixel;
        }
        if (initialWorldPerPixel.current != null) {
            reveal.uRadius.value = (REVEAL_RADIUS * worldPerPixel) / initialWorldPerPixel.current;
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

        if (!sameWindow(window_, next)) setWindow(next);
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
