import * as React from 'react';
import { useSnapshot } from 'valtio';
import { state } from '../rtf-app/state';
import { getTitle } from './utils';

export const InfoPanel: React.FC = () => {
    const { selectedEntity } = useSnapshot(state);

    if (!selectedEntity) {
        return null;
    }

    return (
        <aside className="absolute top-0 right-0 flex h-full w-full max-w-[400px] flex-col border-l border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                <h2 className="text-sm font-semibold text-neutral-800">{getTitle(selectedEntity)}</h2>
                <button
                    type="button"
                    onClick={() => state.closeInfoPanel()}
                    className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                    aria-label="Close panel"
                >
                    ✕
                </button>
            </div>
            <div className="flex-1 space-y-4 overflow-auto p-4">
                {/* Краткое описание */}
                {selectedEntity.data.description && (
                    <section>
                        <div className="mb-1 text-xs tracking-wide text-neutral-500">Краткое описание</div>
                        <div className="text-sm whitespace-pre-wrap text-neutral-800">
                            {selectedEntity.data.description}
                        </div>
                    </section>
                )}

                {/* Фотографии */}
                {selectedEntity.data.images && selectedEntity.data.images.length > 0 && (
                    <section>
                        <div className="mb-1 text-xs tracking-wide text-neutral-500">Фотографии</div>
                        <ul className="space-y-2">
                            {selectedEntity.data.images.map((image) => (
                                <li
                                    key={image.id}
                                    className="mb-1 text-xs tracking-wide text-neutral-500"
                                >{`/public/images/${image.id}/${image.year}`}</li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </aside>
    );
};
