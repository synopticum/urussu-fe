import * as React from 'react';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, OrthographicCamera, ShaderMaterial, Vector2 } from 'three';

const mod = (v: number, period: number) => ((v % period) + period) % period;

// Paper stand-in for the flat #fffaf0 clear color: a large static plane behind
// the tiles (z=-2, they sit at z=-1) whose fragment shader layers soft
// mottling, fine grain, and a gentle vignette over the base tone. Everything
// is static: paper doesn't shimmer.
//
// Anchoring: the paper is glued to the world, so it scrolls with the map
// while dragging. Doing this naively (vWorldPos / featureSize) breaks float32:
// the map sits at world coords ~40-60 while features are sub-pixel in world
// units, and a varying interpolated across a huge plane cannot resolve that.
// Instead the viewport's world offset is computed per frame on the CPU in
// double precision, folded into per-octave lattice offsets (mod a repeat
// period far larger than the screen), and the shader works in small
// screen-space coordinates. Feature sizes stay constant on screen at any
// zoom; the pattern only re-derives while zooming.
export const PaperBackground: React.FC = () => {
    const material = useMemo(
        () =>
            new ShaderMaterial({
                uniforms: {
                    uResolution: { value: new Vector2(1, 1) },
                    // Per-layer lattice offsets anchoring the noise to the
                    // world; updated every frame below (see comment above)
                    uOffA: { value: new Vector2() },
                    uOffB: { value: new Vector2() },
                    uOffC: { value: new Vector2() },
                    uOffGrain: { value: new Vector2() },
                    uBase: { value: new Color('#fffaf0') },
                    uWarm: { value: new Color('#f5edd8') },
                },
                vertexShader: /* glsl */ `
                    void main() {
                        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: /* glsl */ `
                    #define MOTTLING 0.12
                    #define GRAIN 0.07
                    #define VIGNETTE 0.09
                    #define HUE_DRIFT 0.6
                    // Repeat periods in lattice cells; even the smallest
                    // (36 px/octave, 2 px grain) repeats far outside any
                    // viewport, so no tiling is ever visible
                    #define PERIOD 256.0
                    #define GRAIN_PERIOD 4096.0
                    uniform vec2 uResolution;
                    uniform vec2 uOffA;
                    uniform vec2 uOffB;
                    uniform vec2 uOffC;
                    uniform vec2 uOffGrain;
                    uniform vec3 uBase;
                    uniform vec3 uWarm;

                    // "Hash without sine" (Dave Hoskins): precise for any
                    // input magnitude, unlike fract(sin(...) * ...)
                    float hash(vec2 p) {
                        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
                        p3 += dot(p3, p3.yzx + 33.33);
                        return fract((p3.x + p3.y) * p3.z);
                    }

                    // Smooth value noise on a periodic lattice
                    float vnoise(vec2 p, float period) {
                        vec2 i = mod(floor(p), period);
                        vec2 f = fract(p);
                        vec2 u = f * f * (3.0 - 2.0 * f);
                        return mix(
                            mix(hash(i), hash(mod(i + vec2(1.0, 0.0), period)), u.x),
                            mix(hash(i + vec2(0.0, 1.0)), hash(mod(i + vec2(1.0, 1.0), period)), u.x),
                            u.y
                        );
                    }

                    void main() {
                        // Soft blotches (~480/140/36 px features), with a
                        // slight warm/cool hue drift, not just brightness
                        float blotch = vnoise(uOffA + gl_FragCoord.xy / 480.0, PERIOD) * 0.5
                            + vnoise(uOffB + gl_FragCoord.xy / 140.0, PERIOD) * 0.3
                            + vnoise(uOffC + gl_FragCoord.xy / 36.0, PERIOD) * 0.2;
                        vec3 color = mix(uBase, uWarm, (blotch - 0.5) * 2.0 * HUE_DRIFT);
                        color *= 1.0 + (blotch - 0.5) * 2.0 * MOTTLING;

                        // Fine tooth: 2 device px per cell so the grain stays
                        // visible on high-DPI screens
                        vec2 grainCell = mod(floor(uOffGrain + gl_FragCoord.xy / 2.0), GRAIN_PERIOD);
                        color *= 1.0 + (hash(grainCell) - 0.5) * 2.0 * GRAIN;

                        // Gentle vignette, like a scanned sheet: corners a few
                        // percent darker and slightly warmer
                        vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
                        float vig = smoothstep(0.55, 1.7, length(ndc));
                        color *= 1.0 - vig * VIGNETTE;
                        color = mix(color, color * uWarm, vig * 0.15);

                        gl_FragColor = vec4(color, 1.0);
                        #include <colorspace_fragment>
                    }
                `,
            }),
        []
    );

    // Fold the viewport's world offset into per-layer lattice offsets. The
    // fragment at screen pixel S shows world point camPos + (S - res/2) *
    // worldPerPixel, so its lattice coordinate is camPos/(wpp*featurePx) -
    // res/(2*featurePx) + S/featurePx — the shader only needs the last term.
    // Everything here is in DEVICE pixels to match gl_FragCoord; r3f's size
    // is in CSS pixels, so it must be scaled by dpr. Same world-per-pixel
    // math as TileLayer's useFrame.
    useFrame(({ camera, size: frameSize, viewport }) => {
        if (!(camera instanceof OrthographicCamera)) return;
        const dpr = viewport.dpr;
        material.uniforms.uResolution.value.set(frameSize.width * dpr, frameSize.height * dpr);
        const worldPerPixel = (camera.top - camera.bottom) / camera.zoom / (frameSize.height * dpr);
        const setOff = (uniform: { value: Vector2 }, featurePx: number, period: number) => {
            uniform.value.set(
                mod(camera.position.x / (worldPerPixel * featurePx) - (frameSize.width * dpr) / (2 * featurePx), period),
                mod(camera.position.y / (worldPerPixel * featurePx) - (frameSize.height * dpr) / (2 * featurePx), period)
            );
        };
        setOff(material.uniforms.uOffA, 480, 256);
        setOff(material.uniforms.uOffB, 140, 256);
        setOff(material.uniforms.uOffC, 36, 256);
        setOff(material.uniforms.uOffGrain, 2, 4096);
    });

    return (
        <mesh position={[0, 0, -2]} material={material} raycast={() => null}>
            <planeGeometry args={[1000, 1000]} />
        </mesh>
    );
};
