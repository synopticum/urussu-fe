import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BufferGeometry, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';
import { fetchDots, fetchObjects, type Dot, type MapObject } from './api';
import { MapCamera, type Bounds } from './MapCamera';

// Web Mercator (EPSG:3857), same as Leaflet's default CRS: x = longitude,
// y = ln(tan(pi/4 + lat/2)) — the 180/pi factor keeps x and y in the same
// degree-like units. Northern latitudes are stretched by 1/cos(lat).
function toWorld(longitude: number, latitude: number): [number, number] {
    const latRad = (latitude * Math.PI) / 180;
    return [longitude, Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * (180 / Math.PI)];
}

function ObjectShape({ object }: { object: MapObject }) {
    // A single line loop connects the points in array order and closes first-to-last
    const geometry = useMemo(() => {
        const points = object.coordinates.map((c) => {
            const [x, y] = toWorld(c.longitude, c.latitude);
            return new Vector3(x, y, 0);
        });
        return new BufferGeometry().setFromPoints(points);
    }, [object]);

    // Invisible filled mesh so clicks anywhere inside the polygon register
    const hitGeometry = useMemo(() => {
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
            <lineLoop geometry={geometry}>
                <lineBasicMaterial color="gray" />
            </lineLoop>
            <mesh geometry={hitGeometry} onClick={() => console.log(object)}>
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
        </group>
    );
}

export default function App() {
    const [dots, setDots] = useState<Dot[]>([]);
    const [objects, setObjects] = useState<MapObject[]>([]);

    useEffect(() => {
        fetchDots().then(setDots).catch(console.error);
        fetchObjects().then(setObjects).catch(console.error);
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
        if (xs.length === 0) return null;
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
        };
    }, [dots, objects]);

    return (
        <Canvas orthographic>
            <color attach="background" args={['#fffaf0']} />
            <MapCamera bounds={bounds} />
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
        </Canvas>
    );
}
