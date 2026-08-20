export interface DotData {
    id: string;
    title: string;
    shortDescription: string;
    layer: string;
    coordinates: readonly [number, number]; // [latitude, longitude]
}

export interface ObjectData {
    id: string;
    house: string;
    street: string;
    description: string;
    coordinates: readonly { latitude: number; longitude: number }[];
    // Present only on circular objects: a single center coordinate plus this radius
    radius?: number;
}

export interface PathData {
    id: string;
    coordinates: readonly { latitude: number; longitude: number }[];
}
