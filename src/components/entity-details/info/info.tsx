import * as React from 'react';
import { InfoProps } from './types';
import { state } from '../state';

import { getStaticUrl } from '@/utils/get-static-url';

export const Info: React.FC<InfoProps> = ({ entityData }) => {
    const { type, data } = entityData;

    return (
        <>
            {/* Краткое описание */}
            {data.description && (
                <section>
                    <div className="mb-1 text-xs tracking-wide text-neutral-500">Краткое описание</div>
                    <div className="text-sm whitespace-pre-wrap text-neutral-800">{data.description}</div>
                </section>
            )}

            {/* Фотографии */}
            {data.images && data.images.length > 0 && (
                <section>
                    <div className="mb-1 text-xs tracking-wide text-neutral-500">Фотографии</div>
                    <ul className="space-y-4">
                        {data.images.map((image) => {
                            const id = data.id.split('-')[0];
                            const url = getStaticUrl(`/photos/${type}s/${id}/${image.year}.jpg`);

                            return (
                                <li key={image.id} className="mb-1 text-xs tracking-wide text-neutral-500">
                                    <button
                                        type="button"
                                        className="block w-full cursor-zoom-in"
                                        onClick={() => {
                                            state.photo = { entityId: data.id, url };
                                        }}
                                    >
                                        <img
                                            src={url}
                                            width="100%"
                                            alt=""
                                            className="rounded-md brightness-80 transition hover:brightness-100"
                                        />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </>
    );
};
