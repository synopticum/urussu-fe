import { proxy } from 'valtio';
import {
    DotsServiceService,
    ObjectsServiceService,
    OpenAPI,
    PathsServiceService,
    type v1ListDotsResponse,
    type v1ListObjectsResponse,
    type v1ListPathsResponse,
} from '../../openapi/client';
import { CommentsStatus, DotData, ObjectData, PathData, SelectedEntity } from './types';

class Store {
    dots: DotData[] = [];
    objects: ObjectData[] = [];
    paths: PathData[] = [];
    selectedEntity: SelectedEntity | null = null;
    comments: unknown[] = [];
    commentsStatus: CommentsStatus = 'idle';

    selectEntity(entity: SelectedEntity) {
        this.selectedEntity = entity;
        this.resetComments();
    }

    closeInfoPanel() {
        this.selectedEntity = null;
        this.resetComments();
    }

    // NOTE: all fetch methods must stay regular methods, not arrow
    // properties — an arrow function would capture the raw (unproxied)
    // instance as `this`, and its assignments would bypass valtio's proxy
    // traps, so nothing re-renders.
    async fetchAll() {
        await Promise.all([this.fetchDots(), this.fetchObjects(), this.fetchPaths()]);
    }

    async fetchComments(entityId: string) {
        this.commentsStatus = 'loading';

        try {
            const headers: Record<string, string> = { Accept: 'application/json' };

            if (typeof OpenAPI.TOKEN === 'string' && OpenAPI.TOKEN) {
                headers['Authorization'] = `Bearer ${OpenAPI.TOKEN}`;
            }

            const response = await fetch(
                `${OpenAPI.BASE}/comments?entity_id=${encodeURIComponent(entityId)}`,
                { headers },
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${response.status}`);
            }

            const data = await response.json();
            this.comments = Array.isArray(data) ? data : (data?.comments ?? []);
            this.commentsStatus = 'success';
        } catch {
            this.comments = [];
            this.commentsStatus = 'error';
        }
    }

    private resetComments() {
        this.comments = [];
        this.commentsStatus = 'idle';
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

export const appStore = proxy(new Store());
