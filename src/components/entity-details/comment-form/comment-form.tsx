import * as React from 'react';
import { useSnapshot } from 'valtio';
import { state } from './state';

export const CommentForm: React.FC = () => {
    const { body, isTooLong, isValid, serverError } = useSnapshot(state);

    return (
        <form
            className="space-y-2"
            onSubmit={(event) => {
                event.preventDefault();
                void state.onSubmit();
            }}
        >
            <textarea
                value={body}
                onChange={(event) => {
                    state.body = event.target.value;
                }}
                placeholder="Новый комментарий"
                rows={3}
                className={`w-full resize-none rounded border p-2 text-sm text-neutral-800 outline-none focus:border-neutral-400 ${
                    isTooLong ? 'border-red-500 focus:border-red-500' : 'border-neutral-200'
                }`}
            />
            <button
                type="submit"
                disabled={!isValid}
                className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Отправить
            </button>

            {serverError && <div className="text-sm text-red-600">{serverError}</div>}
        </form>
    );
};
