import * as React from 'react';
import { CommentProps } from './types';
import { formatDate } from './utils';

export const Comment: React.FC<CommentProps> = ({ comment }) => {
    return (
        <div className="text-sm break-all text-neutral-800">
            <div className="whitespace-pre-wrap">{comment.body}</div>
            <div className="mt-1 text-xs text-neutral-500">
                {comment.name}, {comment.createdAt && formatDate(comment.createdAt)}
            </div>
        </div>
    );
};
