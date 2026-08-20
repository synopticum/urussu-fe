// Semi-transparent overlay shown while an object is hovered. Opacity eases
// from 0 over HIGHLIGHT_FADE_MS; the mesh ignores raycasts so it never
// steals pointer events from the fill mesh underneath it. Deliberately a
// plain material: it must stay visible inside the mouse "glass" circle,
// where the fill itself is discarded.
import * as React from 'react';
import { useMemo } from 'react';
import { MeshBasicMaterial } from 'three';
import { HIGHLIGHT_COLOR, HIGHLIGHT_FADE_MS, HIGHLIGHT_OPACITY } from './constants';
import { HighlightProps } from './types';
import { useFrame } from '@react-three/fiber';

export const Highlight: React.FC<HighlightProps> = ({ children }) => {
    const material = useMemo(
        () => new MeshBasicMaterial({ color: HIGHLIGHT_COLOR, transparent: true, opacity: 0, depthWrite: false }),
        []
    );
    useFrame((_, delta) => {
        material.opacity = Math.min(
            HIGHLIGHT_OPACITY,
            material.opacity + (delta * 1000 * HIGHLIGHT_OPACITY) / HIGHLIGHT_FADE_MS
        );
    });
    return (
        <mesh position={[0, 0, -0.005]} material={material} raycast={() => null}>
            {children}
        </mesh>
    );
};
