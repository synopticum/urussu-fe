/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetPathResponse } from '../models/v1GetPathResponse';
import type { v1ListPathsResponse } from '../models/v1ListPathsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PathsServiceService {
    /**
     * ListPaths returns paths from the database.
     * @returns v1ListPathsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static pathsServiceListPaths({
        limit,
    }: {
        /**
         * Maximum number of paths to return. Defaults to 1000 when omitted.
         */
        limit?: number,
    }): CancelablePromise<v1ListPathsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/paths',
            query: {
                'limit': limit,
            },
        });
    }
    /**
     * GetPath returns a single path by its ID.
     * @returns v1GetPathResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static pathsServiceGetPath({
        id,
    }: {
        /**
         * ID of the path to return.
         */
        id: string,
    }): CancelablePromise<v1GetPathResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/paths/{id}',
            path: {
                'id': id,
            },
        });
    }
}
