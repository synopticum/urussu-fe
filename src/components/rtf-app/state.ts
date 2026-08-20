import { proxy } from 'valtio';
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
} from '../../openapi/client';
import { DotData, ObjectData, PathData } from './types';

OpenAPI.BASE = 'http://localhost:8081';

async function login(): Promise<void> {
    const { token } = (await AuthServiceService.authServiceLogin({
        body: { email: 'test@test.com', password: 'asdfasdf' },
    })) as v1LoginResponse;
    OpenAPI.TOKEN = token;
}

class State {
    dots: DotData[] = [];
    objects: ObjectData[] = [];
    paths: PathData[] = [];

    // NOTE: all fetch methods must stay regular methods, not arrow
    // properties — an arrow function would capture the raw (unproxied)
    // instance as `this`, and its assignments would bypass valtio's proxy
    // traps, so nothing re-renders.
    async fetchAll() {
        await Promise.all([this.fetchDots(), this.fetchObjects(), this.fetchPaths()]);
    }

    private async fetchDots() {
        await login();

        const { dots } = (await DotsServiceService.dotsServiceListDots({})) as v1ListDotsResponse;
        this.dots = (dots ?? []) as unknown as DotData[];
    }

    private async fetchObjects() {
        await login();

        const { objects } = (await ObjectsServiceService.objectsServiceListObjects({})) as v1ListObjectsResponse;
        this.objects = (objects ?? []) as ObjectData[];
    }

    private async fetchPaths() {
        await login();

        const { paths } = (await PathsServiceService.pathsServiceListPaths({})) as v1ListPathsResponse;
        this.paths = (paths ?? []) as PathData[];
    }
}

export const state = proxy(new State());
