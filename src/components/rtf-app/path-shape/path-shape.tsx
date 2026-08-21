import * as React from 'react';
import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { BufferGeometry, Line, LineDashedMaterial, Vector2, Vector3, Path as ThreePath } from 'three';
import { PATH_CORNER_RADIUS } from './constants';
import { PathShapeProps } from './types';
import { buildRoundedPath, toWorld } from '../utils';
import { appStore } from '@/stores';
import { CLICK_MAX_DELTA, reveal } from '../constants';

export const PathShape: React.FC<PathShapeProps> = ({ path }) => {
    // An open line connects the points in array order with rounded corners;
    // first and last are NOT joined, and the two endpoints stay sharp.
    // computeLineDistances() is required for the dashed material to render dashes.
    const line = useMemo(() => {
        const rounded = new ThreePath();
        buildRoundedPath(
            rounded,
            path.coordinates.map((c) => {
                const [x, y] = toWorld(c.longitude, c.latitude);
                return new Vector2(x, y);
            }),
            PATH_CORNER_RADIUS,
            false
        );
        const points = rounded.getPoints(12).map((p) => new Vector3(p.x, p.y, 0));
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
                    '#include <begin_vertex>\nvWorldPos = (modelMatrix * vec4(position, 1.0)).xy;'
                );
            shader.fragmentShader = shader.fragmentShader
                .replace(
                    '#include <common>',
                    '#include <common>\nuniform vec2 uMouse;\nuniform float uRadius;\nvarying vec2 vWorldPos;'
                )
                .replace('void main() {', 'void main() {\n\tif (distance(vWorldPos, uMouse) < uRadius) discard;');
        };
        const result = new Line(new BufferGeometry().setFromPoints(points), material);
        result.computeLineDistances();
        return result;
    }, [path]);

    return (
        <primitive
            object={line}
            onClick={(e: ThreeEvent<MouseEvent>) => {
                // Ignore clicks that were actually map drags (see CLICK_MAX_DELTA)
                if (e.delta > CLICK_MAX_DELTA) return;
                // Objects outrank paths: the path line sits closer to the
                // camera than the object fills, so on overlap this handler
                // fires first — but if the same ray also hit an object fill,
                // skip selection here and let the object's own handler run.
                if (e.intersections.some((hit) => hit.object.userData.isObjectFill)) return;
                e.stopPropagation();
                appStore.selectEntity({ type: 'path', data: path });
            }}
        />
    );
};
