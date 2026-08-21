/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1CommentEntityType } from './v1CommentEntityType';
export type v1CreateCommentRequest = {
    /**
     * ID of the entity (dot, object or path) to comment on. Required.
     */
    entityId?: string;
    /**
     * Kind of the entity given by entity_id. Required.
     */
    entityType?: v1CommentEntityType;
    /**
     * Comment text. Required, max 240 characters.
     */
    body?: string;
};

