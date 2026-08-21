import * as React from 'react';
import { useSnapshot } from 'valtio';
import { appStore } from '@/stores/app';
import { CommentForm } from '../comment-form';
import { Comment } from './comment';
import { CommentsProps } from './types';

export const Comments: React.FC<CommentsProps> = ({ entityId }) => {
    const { comments, commentsStatus } = useSnapshot(appStore);

    React.useEffect(() => {
        appStore.fetchComments(entityId);
    }, [entityId]);

    return (
        <section className="flex h-full flex-col space-y-2">
            <div className="flex-1 space-y-2">
                {commentsStatus === 'error' && (
                    <div className="text-sm text-neutral-800">Что-то пошло не так при загрузке комментариев</div>
                )}

                {commentsStatus === 'success' && comments.length === 0 && (
                    <div className="text-sm text-neutral-800">Пока нет ни одного комментария</div>
                )}

                {commentsStatus === 'success' &&
                    comments.map((comment, index) => <Comment key={comment.id ?? index} comment={comment} />)}
            </div>

            <CommentForm />
        </section>
    );
};
