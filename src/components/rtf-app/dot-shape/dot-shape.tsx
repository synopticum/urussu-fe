import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import { useRef, useState } from 'react';
import { MathUtils, Mesh } from 'three';
import { DOT_HOVER_SCALE } from './constants';
import { DotShapeProps } from './types';
import { HIGHLIGHT_FADE_MS } from '../highlight/constants';
import { state } from '../state';
import { toWorld } from '../utils';

export const DotShape: React.FC<DotShapeProps> = ({ dot }) => {
    const [hovered, setHovered] = useState(false);
    const mesh = useRef<Mesh>(null);
    const progress = useRef(0);

    useFrame((_, delta) => {
        const step = (delta * 1000) / HIGHLIGHT_FADE_MS;
        progress.current = MathUtils.clamp(progress.current + (hovered ? step : -step), 0, 1);
        mesh.current?.scale.setScalar(1 + (DOT_HOVER_SCALE - 1) * progress.current);
    });

    return (
        <mesh
            ref={mesh}
            position={[...toWorld(dot.coordinates[1], dot.coordinates[0]), 0]}
            onClick={(e) => {
                e.stopPropagation();
                state.selectEntity({ type: 'dot', data: dot });
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
        >
            <circleGeometry args={[0.125, 32]} />
            <meshBasicMaterial color="darkorange" />
        </mesh>
    );
};
