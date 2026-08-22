import * as React from 'react';
import { IconCross } from '../../icons';
import { state } from '../state';
import { useEffect } from 'react';

type PhotoOverlayProps = { url: string };

export const PhotoOverlay: React.FC<PhotoOverlayProps> = ({ url }) => {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                state.photo = null;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div
            className="absolute inset-0 right-[400px] z-10 flex items-center justify-center bg-black/80 p-6"
            onClick={() => {
                state.photo = null;
            }}
        >
            <img
                src={url}
                alt=""
                className="max-h-full max-w-full object-contain"
                onClick={(event) => event.stopPropagation()}
            />

            <button
                type="button"
                onClick={() => {
                    state.photo = null;
                }}
                className="absolute top-4 right-4 rounded bg-black/50 p-1 text-white hover:bg-black/70"
                aria-label="Close photo"
            >
                <IconCross />
            </button>
        </div>
    );
};
