import { useEffect, useMemo, useState, Suspense, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { BufferGeometry, Color, EllipseCurve, Line, LineDashedMaterial, MeshBasicMaterial, ShaderMaterial, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';
import { fetchDots, fetchObjects, fetchPaths, type Dot, type MapObject, type Path } from './api';
import { MapCamera, type Bounds } from './MapCamera';
import { TileLayer } from './TileLayer';
import { reveal } from './reveal';

// Web Mercator (EPSG:3857), same as Leaflet's default CRS: x = longitude,
// y = ln(tan(pi/4 + lat/2)) — the 180/pi factor keeps x and y in the same
// degree-like units. Northern latitudes are stretched by 1/cos(lat).
function toWorld(longitude: number, latitude: number): [number, number] {
    const latRad = (latitude * Math.PI) / 180;
    return [longitude, Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * (180 / Math.PI)];
}

// Radius values are in the thousands (meter-like); world units are degrees,
// so scale them down to land in the same size range as dots and polygons.
const RADIUS_SCALE = 4 / 111320; // ≈ 4x meters-per-degree of latitude

// Tufte-style fills (Envisioning Information): flat pale yellow-brown ink on
// the paper-white background, with a darker muted brown for the outlines.
const OBJECT_FILL = '#dfcd99';
const OBJECT_STROKE = '#7d6a45';

// Fill ink for objects: the flat Tufte color everywhere except inside the
// mouse "glass" circle, where fragments are discarded so the revealed raster
// tile shows through. Reads the same shared uniforms as the tile shader, so
// TileLayer's per-frame update drives this material too (see reveal.ts).
const fillMaterial = new ShaderMaterial({
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

// Hover highlight: a pale cream wash over the object, fading in quickly.
const HIGHLIGHT_COLOR = '#f8f0d8';
const HIGHLIGHT_OPACITY = 0.45;
const HIGHLIGHT_FADE_MS = 150;

// Semi-transparent overlay shown while an object is hovered. Opacity eases
// from 0 over HIGHLIGHT_FADE_MS; the mesh ignores raycasts so it never
// steals pointer events from the fill mesh underneath it. Deliberately a
// plain material: it must stay visible inside the mouse "glass" circle,
// where the fill itself is discarded.
function Highlight({ children }: { children: ReactNode }) {
    const material = useMemo(
        () => new MeshBasicMaterial({ color: HIGHLIGHT_COLOR, transparent: true, opacity: 0, depthWrite: false }),
        [],
    );
    useFrame((_, delta) => {
        material.opacity = Math.min(HIGHLIGHT_OPACITY, material.opacity + (delta * 1000 * HIGHLIGHT_OPACITY) / HIGHLIGHT_FADE_MS);
    });
    return (
        <mesh position={[0, 0, -0.005]} material={material} raycast={() => null}>
            {children}
        </mesh>
    );
}

function ObjectShape({ object }: { object: MapObject }) {
    // Circular objects: one center coordinate + radius instead of a polygon
    if (object.radius != null && object.coordinates.length === 1) {
        return <CircleObjectShape object={object} />;
    }
    return <PolygonObjectShape object={object} />;
}

function CircleObjectShape({ object }: { object: MapObject }) {
    const [hovered, setHovered] = useState(false);
    const [cx, cy] = toWorld(object.coordinates[0].longitude, object.coordinates[0].latitude);
    const radius = object.radius! * RADIUS_SCALE;

    // Outline circle centered at the origin; the group positions it on the map
    const geometry = useMemo(() => {
        const points = new EllipseCurve(0, 0, radius, radius).getPoints(64);
        return new BufferGeometry().setFromPoints(points);
    }, [radius]);

    return (
        <group position={[cx, cy, 0]}>
            {/* Filled mesh slightly behind the outline so the two never z-fight */}
            <mesh
                position={[0, 0, -0.01]}
                material={fillMaterial}
                onClick={() => console.log(object)}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={() => setHovered(false)}
            >
                <circleGeometry args={[radius, 64]} />
            </mesh>
            {hovered && (
                <Highlight>
                    <circleGeometry args={[radius, 64]} />
                </Highlight>
            )}
            <lineLoop geometry={geometry}>
                <lineBasicMaterial color={OBJECT_STROKE} />
            </lineLoop>
        </group>
    );
}

function PolygonObjectShape({ object }: { object: MapObject }) {
    const [hovered, setHovered] = useState(false);
    // A single line loop connects the points in array order and closes first-to-last
    const geometry = useMemo(() => {
        const points = object.coordinates.map((c) => {
            const [x, y] = toWorld(c.longitude, c.latitude);
            return new Vector3(x, y, 0);
        });
        return new BufferGeometry().setFromPoints(points);
    }, [object]);

    const fillGeometry = useMemo(() => {
        const shape = new Shape(
            object.coordinates.map((c) => {
                const [x, y] = toWorld(c.longitude, c.latitude);
                return new Vector2(x, y);
            }),
        );
        return new ShapeGeometry(shape);
    }, [object]);

    return (
        <group>
            {/* Filled mesh slightly behind the outline so the two never z-fight */}
            <mesh
                geometry={fillGeometry}
                position={[0, 0, -0.01]}
                material={fillMaterial}
                onClick={() => console.log(object)}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={() => setHovered(false)}
            />
            {hovered && (
                <Highlight>
                    <primitive object={fillGeometry} attach="geometry" />
                </Highlight>
            )}
            <lineLoop geometry={geometry}>
                <lineBasicMaterial color={OBJECT_STROKE} />
            </lineLoop>
        </group>
    );
}

function PathShape({ path }: { path: Path }) {
    // An open line connects the points in array order; first and last are NOT joined.
    // computeLineDistances() is required for the dashed material to render dashes.
    const line = useMemo(() => {
        const points = path.coordinates.map((c) => {
            const [x, y] = toWorld(c.longitude, c.latitude);
            return new Vector3(x, y, 0);
        });
        const material = new LineDashedMaterial({ color: 'gray', dashSize: 0.25, gapSize: 0.125 });
        // Discard fragments inside the mouse "glass" circle, same as the
        // object fills: reads the shared reveal uniforms (see reveal.ts).
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uMouse = reveal.uMouse;
            shader.uniforms.uRadius = reveal.uRadius;
            shader.vertexShader = shader.vertexShader
                .replace('#include <common>', '#include <common>\nvarying vec2 vWorldPos;')
                .replace(
                    '#include <begin_vertex>',
                    '#include <begin_vertex>\nvWorldPos = (modelMatrix * vec4(position, 1.0)).xy;',
                );
            shader.fragmentShader = shader.fragmentShader
                .replace(
                    '#include <common>',
                    '#include <common>\nuniform vec2 uMouse;\nuniform float uRadius;\nvarying vec2 vWorldPos;',
                )
                .replace(
                    'void main() {',
                    'void main() {\n\tif (distance(vWorldPos, uMouse) < uRadius) discard;',
                );
        };
        const result = new Line(new BufferGeometry().setFromPoints(points), material);
        result.computeLineDistances();
        return result;
    }, [path]);

    return <primitive object={line} />;
}

export default function App() {
    const [dots, setDots] = useState<Dot[]>([]);
    const [objects, setObjects] = useState<MapObject[]>([]);
    const [paths, setPaths] = useState<Path[]>([]);

    useEffect(() => {
        fetchDots().then(setDots).catch(console.error);
        fetchObjects().then(setObjects).catch(console.error);
        fetchPaths().then(setPaths).catch(console.error);
    }, []);

    const bounds = useMemo<Bounds | null>(() => {
        const xs: number[] = [];
        const ys: number[] = [];
        const push = (longitude: number, latitude: number) => {
            const [x, y] = toWorld(longitude, latitude);
            xs.push(x);
            ys.push(y);
        };
        for (const d of dots) push(d.coordinates[1], d.coordinates[0]);
        for (const object of objects) {
            for (const c of object.coordinates) push(c.longitude, c.latitude);
        }
        for (const path of paths) {
            for (const c of path.coordinates) push(c.longitude, c.latitude);
        }
        if (xs.length === 0) return null;
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
        };
    }, [dots, objects, paths]);

    return (
        <Canvas orthographic>
            <color attach="background" args={['#fffaf0']} />
            <MapCamera bounds={bounds} />
            <Suspense fallback={null}>
                <TileLayer />
            </Suspense>
            {dots.map((dot) => (
                <mesh
                    key={dot.id}
                    position={[...toWorld(dot.coordinates[1], dot.coordinates[0]), 0]}
                    onClick={() => console.log(dot)}
                >
                    <circleGeometry args={[0.125, 32]} />
                    <meshBasicMaterial color="darkorange" />
                </mesh>
            ))}
            {objects.map((object) => (
                <ObjectShape key={object.id} object={object} />
            ))}
            {paths.map((path) => (
                <PathShape key={path.id} path={path} />
            ))}
        </Canvas>
    );
}
