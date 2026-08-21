import { proxy } from 'valtio';
import {
    CommentsServiceService,
    DotsServiceService,
    ObjectsServiceService,
    PathsServiceService,
    v1CommentEntityType,
    type v1Comment,
    type v1CreateCommentResponse,
    type v1ListCommentsResponse,
    type v1ListDotsResponse,
    type v1ListObjectsResponse,
    type v1ListPathsResponse,
} from '../../openapi/client';
import { CommentsStatus, DotData, ObjectData, PathData, SelectedEntity } from './types';
import { COMMENT_ENTITY_TYPE_MAP } from './constants';

class Store {
    dots: DotData[] = [];
    objects: ObjectData[] = [];
    paths: PathData[] = [];
    selectedEntity: SelectedEntity | null = null;
    comments: v1Comment[] = [];
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
            const { comments } = (await CommentsServiceService.commentsServiceListComments({
                entityId,
            })) as v1ListCommentsResponse;

            this.comments = (comments ?? []) as v1Comment[];
            this.commentsStatus = 'success';
        } catch {
            this.comments = [];
            this.commentsStatus = 'error';
        }
    }

    async addComment(body: string) {
        if (!this.selectedEntity) {
            throw new Error('Не выбрана сущность для комментария');
        }

        const { comment } = (await CommentsServiceService.commentsServiceCreateComment({
            body: {
                entityId: this.selectedEntity.data.id,
                entityType: COMMENT_ENTITY_TYPE_MAP[this.selectedEntity.type],
                body,
            },
        })) as v1CreateCommentResponse;

        if (comment) {
            this.comments.push(comment);
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
