import { Suspense, useEffect, useMemo, useState } from 'react';
import { Dot, fetchDots, fetchObjects, fetchPaths, MapObject, Path } from '../../api';
import { Canvas } from '@react-three/fiber';
import { Bounds, MapCamera } from './map-camera';
import { TileLayer } from './tile-layer';
import { DotShape } from './dot-shape';
import { ObjectShape } from './object-shape';
import { PathShape } from './path-shape';
import { toWorld } from './utils';

export const RtfApp = () => {
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
                <DotShape key={dot.id} dot={dot} />
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