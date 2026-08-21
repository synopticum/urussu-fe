/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { v1Image } from './v1Image';
import type { v1Point } from './v1Point';
export type v1Object = {
    id?: string;
    house?: string;
    street?: string;
    description?: string;
    /**
     * Radius of the object, when set.
     */
    radius?: number;
    /**
     * Polygon outline of the object on the map.
     */
    coordinates?: Array<v1Point>;
    images?: Array<v1Image>;
};

