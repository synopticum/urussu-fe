import * as React from 'react';
import { useMemo, useState } from 'react';
import { BufferGeometry, EllipseCurve } from 'three';
import { CircleObjectShapeProps } from './types';
import { fillMaterial, OBJECT_STROKE, RADIUS_SCALE } from '../constants';
import { state } from '../../state';
import { toWorld } from '../../utils';
import { Highlight } from '../../highlight';

export const CircleObjectShape: React.FC<CircleObjectShapeProps> = ({ object }) => {
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
                onClick={(e) => {
                    e.stopPropagation();
                    state.selectEntity({ type: 'object', data: object });
                }}
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
};
