import * as React from 'react';
import { useMemo, useState } from 'react';
import { BufferGeometry, ShapeGeometry, Vector2, Vector3 } from 'three';
import { roundedPolygonShape } from './utils';
import { PolygonObjectShapeProps } from './types';
import { fillMaterial, OBJECT_FILL_USER_DATA, OBJECT_STROKE } from '../constants';
import { CLICK_MAX_DELTA } from '../../constants';
import { appStore } from '@/stores';
import { toWorld } from '../../utils';
import { Highlight } from '../../highlight';

export const PolygonObjectShape: React.FC<PolygonObjectShapeProps> = ({ object }) => {
    const [hovered, setHovered] = useState(false);

    const shape = useMemo(() => {
        const points = object.coordinates.map((c) => {
            const [x, y] = toWorld(c.longitude, c.latitude);
            return new Vector2(x, y);
        });
        return roundedPolygonShape(points);
    }, [object]);

    // A single line loop follows the rounded outline and closes first-to-last
    const geometry = useMemo(() => {
        const points = shape.getPoints(12).map((p) => new Vector3(p.x, p.y, 0));
        return new BufferGeometry().setFromPoints(points);
    }, [shape]);

    const fillGeometry = useMemo(() => new ShapeGeometry(shape), [shape]);

    return (
        <group>
            {/* Filled mesh slightly behind the outline so the two never z-fight */}
            <mesh
                geometry={fillGeometry}
                position={[0, 0, -0.01]}
                material={fillMaterial}
                userData={OBJECT_FILL_USER_DATA}
                onClick={(e) => {
                    // Ignore clicks that were actually map drags (see CLICK_MAX_DELTA)
                    if (e.delta > CLICK_MAX_DELTA) return;
                    e.stopPropagation();
                    appStore.selectEntity({ type: 'object', data: object });
                }}
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
};
