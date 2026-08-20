import * as React from 'react';
import { PolygonObjectShape } from './polygon-object-shape';
import { CircleObjectShape } from './circle-object-shape';
import { ObjectShapeProps } from './types';

export const ObjectShape: React.FC<ObjectShapeProps> = ({ object }) => {
    if (object.radius != null && object.coordinates.length === 1) {
        return <CircleObjectShape object={object} />;
    }

    return <PolygonObjectShape object={object} />;
};
