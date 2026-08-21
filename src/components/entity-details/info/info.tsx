import * as React from 'react';
import { InfoProps } from './types';

export const Info: React.FC<InfoProps> = ({ data }) => {
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
                    <ul className="space-y-2">
                        {data.images.map((image) => (
                            <li
                                key={image.id}
                                className="mb-1 text-xs tracking-wide text-neutral-500"
                            >{`/public/images/${image.id}/${image.year}`}</li>
                        ))}
                    </ul>
                </section>
            )}
        </>
    );
};
