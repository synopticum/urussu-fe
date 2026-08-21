/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1CreateCommentRequest } from '../models/v1CreateCommentRequest';
import type { v1CreateCommentResponse } from '../models/v1CreateCommentResponse';
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
    /**
     * CreateComment creates a comment on the entity given by entity_id and
     * entity_type. The author is taken from the authenticated session.
     * @returns v1CreateCommentResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static commentsServiceCreateComment({
        body,
    }: {
        body: v1CreateCommentRequest,
    }): CancelablePromise<v1CreateCommentResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/comments',
            body: body,
        });
    }
}
