/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetDotResponse } from '../models/v1GetDotResponse';
import type { v1ListDotsResponse } from '../models/v1ListDotsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DotsServiceService {
    /**
     * ListDots returns dots from the database.
     * @returns v1ListDotsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static dotsServiceListDots({
        limit,
        layer,
    }: {
        /**
         * Maximum number of dots to return. Defaults to 1000 when omitted.
         */
        limit?: number,
        /**
         * Filter by layer name (e.g. "1980"). Returns dots from all layers when omitted.
         */
        layer?: string,
    }): CancelablePromise<v1ListDotsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/dots',
            query: {
                'limit': limit,
                'layer': layer,
            },
        });
    }
    /**
     * GetDot returns a single dot by its ID.
     * @returns v1GetDotResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static dotsServiceGetDot({
        id,
    }: {
        /**
         * ID of the dot to return.
         */
        id: string,
    }): CancelablePromise<v1GetDotResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/dots/{id}',
            path: {
                'id': id,
            },
        });
    }
}
