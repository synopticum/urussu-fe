import { Vector2 } from 'three';

// Raster tiles and object fills share this "glass lens" state: TileLayer
// updates it every frame from the pointer position, and both the tile
// shader and the object fill shader read the same uniform objects, so one
// update per frame covers every material.
// In world units (degrees) as seen at the initial camera fit; kept constant
// on screen regardless of zoom (see TileLayer's useFrame).
export const REVEAL_RADIUS = 10;

// Uniform objects shared by every material, so the circle position and
// radius are updated once per frame for the whole scene.
export interface RevealUniforms {
    uMouse: { value: Vector2 };
    uRadius: { value: number };
    uPixel: { value: number }; // world units per screen pixel
}

// The mouse starts parked far away until the cursor first enters the canvas
export const reveal: RevealUniforms = {
    uMouse: { value: new Vector2(1e9, 1e9) },
    uRadius: { value: REVEAL_RADIUS },
    uPixel: { value: 1 },
};
