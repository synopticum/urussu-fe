import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { fetchDots, type Dot } from './api';
import { MapCamera, type Bounds } from './MapCamera';

export default function App() {
    const [dots, setDots] = useState<Dot[]>([]);

    useEffect(() => {
        fetchDots().then(setDots).catch(console.error);
    }, []);

    const bounds = useMemo<Bounds | null>(() => {
        if (dots.length === 0) return null;
        const xs = dots.map((d) => d.coordinates[0]);
        const ys = dots.map((d) => d.coordinates[1]);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
        };
    }, [dots]);

    return (
        <Canvas orthographic>
            <color attach="background" args={['#fffaf0']} />
            <MapCamera bounds={bounds} />
            {dots.map((dot) => (
                <mesh
                    key={dot.id}
                    position={[dot.coordinates[0], dot.coordinates[1], 0]}
                    onClick={() => console.log(dot)}
                >
                    <circleGeometry args={[0.25, 32]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            ))}
        </Canvas>
    );
}
