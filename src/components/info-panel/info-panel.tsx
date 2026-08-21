import * as React from 'react';
import { useSnapshot } from 'valtio';
import { state } from '../rtf-app/state';

export const InfoPanel: React.FC = () => {
    const { selectedDot } = useSnapshot(state);

    if (!selectedDot) {
        return null;
    }

    return (
        <aside className="absolute top-0 right-0 flex h-full w-full max-w-[400px] flex-col border-l border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                <h2 className="text-sm font-semibold text-neutral-800">Dot info</h2>
                <button
                    type="button"
                    onClick={() => state.closeInfoPanel()}
                    className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                    aria-label="Close panel"
                >
                    ✕
                </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-xs whitespace-pre-wrap break-all text-neutral-700">
                {JSON.stringify(selectedDot, null, 2)}
            </pre>
        </aside>
    );
};
