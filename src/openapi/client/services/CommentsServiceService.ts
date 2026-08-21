/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1ListCommentsResponse } from '../models/v1ListCommentsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommentsServiceService {
    /**
     * ListComments returns all comments of the entity given by entity_id.
     * @returns v1ListCommentsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static commentsServiceListComments({
        entityId,
    }: {
        /**
         * ID of the entity (dot, object or path) to list comments for. Required.
         */
        entityId?: string,
    }): CancelablePromise<v1ListCommentsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/comments',
            query: {
                'entityId': entityId,
            },
        });
    }
}
