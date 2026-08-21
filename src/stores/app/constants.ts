import { v1CommentEntityType } from '../../openapi/client';

export const COMMENT_ENTITY_TYPE_MAP = {
    dot: v1CommentEntityType.COMMENT_ENTITY_TYPE_DOT,
    object: v1CommentEntityType.COMMENT_ENTITY_TYPE_OBJECT,
    path: v1CommentEntityType.COMMENT_ENTITY_TYPE_PATH,
} as const;
