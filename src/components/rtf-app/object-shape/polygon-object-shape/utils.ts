import { Shape, Vector2 } from 'three';
import { buildRoundedPath } from '../../utils';
import { CORNER_RADIUS } from './constants';

export const roundedPolygonShape = (points: Vector2[]): Shape => {
    const shape = new Shape();
    buildRoundedPath(shape, points, CORNER_RADIUS, true);
    return shape;
};
