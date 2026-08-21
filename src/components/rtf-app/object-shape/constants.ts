// Fill ink for objects: the flat Tufte color everywhere except inside the
// mouse "glass" circle, where fragments are discarded so the revealed raster
// tile shows through. Reads the same shared uniforms as the tile shader, so
// TileLayer's per-frame update drives this material too (see reveal.ts).
import { Color, ShaderMaterial } from 'three';
import { reveal } from '../constants';

// Radius values are in the thousands (meter-like); world units are degrees,
// so scale them down to land in the same size range as dots and polygons.
export const RADIUS_SCALE = 4 / 111320; // ≈ 4x meters-per-degree of latitude

// Tufte-style fills (Envisioning Information): flat pale yellow-brown ink on
// the paper-white background, with a darker muted brown for the outlines.
export const OBJECT_FILL = '#dfcd99';
export const OBJECT_STROKE = '#7d6a45';

// Tag on the fill meshes' userData so PathShape's click handler can
// recognize that a click also hit an object and yield to it.
export const OBJECT_FILL_USER_DATA = { isObjectFill: true };

export const fillMaterial = new ShaderMaterial({
    uniforms: {
        uColor: { value: new Color(OBJECT_FILL) },
        uMouse: reveal.uMouse,
        uRadius: reveal.uRadius,
    },
    vertexShader: /* glsl */ `
        varying vec2 vWorldPos;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xy;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform vec2 uMouse;
        uniform float uRadius;
        varying vec2 vWorldPos;
        void main() {
            if (distance(vWorldPos, uMouse) < uRadius) discard;
            gl_FragColor = vec4(uColor, 1.0);
            #include <colorspace_fragment>
        }
    `,
});
