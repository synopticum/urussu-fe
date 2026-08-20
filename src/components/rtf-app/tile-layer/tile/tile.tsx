import { useLoader } from '@react-three/fiber';
import * as React from 'react';
import { useMemo } from 'react';
import { ShaderMaterial, SRGBColorSpace, TextureLoader } from 'three';
import { getTileUrl } from './utils';
import { TileProps } from './types';

export const Tile: React.FC<TileProps> = ({ z, x, y, reveal }) => {
    const texture = useLoader(TextureLoader, getTileUrl(z, x, y));

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
};