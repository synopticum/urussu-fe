import { v1Image } from '../../openapi/client';

export interface DotData {
    id: string;
    title: string;
    description: string;
    layer: string;
    coordinates: readonly [number, number]; // [latitude, longitude]
    images?: readonly v1Image[];
}

export interface ObjectData {
    id: string;
    house: string;
    street: string;
    description: string;
    coordinates: readonly { latitude: number; longitude: number }[];
    // Present only on circular objects: a single center coordinate plus this radius
    radius?: number;
    images?: readonly v1Image[];
}

export interface PathData {
    id: string;
    coordinates: readonly { latitude: number; longitude: number }[];
    title: string;
    description: string;
    images?: readonly v1Image[];
}

export type SelectedEntity =
    | { type: 'dot'; data: DotData }
    | { type: 'object'; data: ObjectData }
    | { type: 'path'; data: PathData };
