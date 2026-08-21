import * as React from 'react';
import { useSnapshot } from 'valtio';
import { appStore } from '../../stores/app';
import { IconComment, IconCross } from '../icons';
import { Comments } from './comments';
import { Info } from './info';
import { state } from './state';
import { getTitle } from './utils';
import { useEffect } from 'react';

export const EntityDetails: React.FC = () => {
    const { selectedEntity } = useSnapshot(appStore);
    const { view } = useSnapshot(state);

    const entityId = selectedEntity?.data.id;

    useEffect(() => {
        state.view = 'info';
    }, [entityId]);

    if (!selectedEntity) {
        return null;
    }

    return (
        <aside className="absolute top-0 right-0 flex h-full w-full max-w-[400px] flex-col border-l border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                <h2 className="text-sm font-semibold text-neutral-800">{getTitle(selectedEntity)}</h2>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => (state.view = view === 'comments' ? 'info' : 'comments')}
                        className={`rounded p-1 hover:bg-neutral-100 hover:text-neutral-800 ${
                            view === 'comments' ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-500'
                        }`}
                        aria-label="Toggle comments"
                    >
                        <IconComment />
                    </button>
                    <button
                        type="button"
                        onClick={() => appStore.closeInfoPanel()}
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label="Close panel"
                    >
                        <IconCross />
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-auto p-4">
                {view === 'comments' ? (
                    <Comments entityId={selectedEntity.data.id} />
                ) : (
                    <Info data={selectedEntity.data} />
                )}
            </div>
        </aside>
    );
};
