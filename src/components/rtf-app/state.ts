import { proxy } from 'valtio';
import {
    DotsServiceService,
    ObjectsServiceService,
    PathsServiceService,
    type v1ListDotsResponse,
    type v1ListObjectsResponse,
    type v1ListPathsResponse,
} from '../../openapi/client';
import { DotData, ObjectData, PathData, SelectedEntity } from './types';

class State {
    dots: DotData[] = [];
    objects: ObjectData[] = [];
    paths: PathData[] = [];
    selectedEntity: SelectedEntity | null = null;

    selectEntity(entity: SelectedEntity) {
        this.selectedEntity = entity;
    }

    closeInfoPanel() {
        this.selectedEntity = null;
    }

    // NOTE: all fetch methods must stay regular methods, not arrow
    // properties — an arrow function would capture the raw (unproxied)
    // instance as `this`, and its assignments would bypass valtio's proxy
    // traps, so nothing re-renders.
    async fetchAll() {
        await Promise.all([this.fetchDots(), this.fetchObjects(), this.fetchPaths()]);
    }

    private async fetchDots() {
        const { dots } = (await DotsServiceService.dotsServiceListDots({})) as v1ListDotsResponse;
        this.dots = (dots ?? []) as unknown as DotData[];
    }

    private async fetchObjects() {
        const { objects } = (await ObjectsServiceService.objectsServiceListObjects({})) as v1ListObjectsResponse;
        this.objects = (objects ?? []) as ObjectData[];
    }

    private async fetchPaths() {
        const { paths } = (await PathsServiceService.pathsServiceListPaths({})) as v1ListPathsResponse;
        this.paths = (paths ?? []) as PathData[];
    }
}

export const state = proxy(new State());
