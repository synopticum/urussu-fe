import {
    AuthServiceService,
    DotsServiceService,
    ObjectsServiceService,
    OpenAPI,
    PathsServiceService,
    type v1ListDotsResponse,
    type v1ListObjectsResponse,
    type v1ListPathsResponse,
    type v1LoginResponse,
} from './openapi/client';

export interface Dot {
    id: string;
    title: string;
    shortDescription: string;
    layer: string;
    coordinates: [number, number]; // [latitude, longitude]
}

export interface MapObject {
    id: string;
    house: string;
    street: string;
    description: string;
    coordinates: { latitude: number; longitude: number }[];
    // Present only on circular objects: a single center coordinate plus this radius
    radius?: number;
}

export interface Path {
    id: string;
    coordinates: { latitude: number; longitude: number }[];
}

OpenAPI.BASE = 'http://localhost:8081';

async function login(): Promise<void> {
    const { token } = (await AuthServiceService.authServiceLogin({
        body: { email: 'test@test.com', password: 'asdfasdf' },
    })) as v1LoginResponse;
    OpenAPI.TOKEN = token;
}

export async function fetchDots(): Promise<Dot[]> {
    await login();

    const { dots } = (await DotsServiceService.dotsServiceListDots({})) as v1ListDotsResponse;
    return (dots ?? []) as Dot[];
}

export async function fetchObjects(): Promise<MapObject[]> {
    await login();

    const { objects } = (await ObjectsServiceService.objectsServiceListObjects({})) as v1ListObjectsResponse;
    return (objects ?? []) as MapObject[];
}

export async function fetchPaths(): Promise<Path[]> {
    await login();

    const { paths } = (await PathsServiceService.pathsServiceListPaths({})) as v1ListPathsResponse;
    return (paths ?? []) as Path[];
}
