/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1GetObjectResponse } from '../models/v1GetObjectResponse';
import type { v1ListObjectsResponse } from '../models/v1ListObjectsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ObjectsServiceService {
    /**
     * ListObjects returns objects from the database.
     * @returns v1ListObjectsResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static objectsServiceListObjects({
        limit,
    }: {
        /**
         * Maximum number of objects to return. Defaults to 1000 when omitted.
         */
        limit?: number,
    }): CancelablePromise<v1ListObjectsResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/objects',
            query: {
                'limit': limit,
            },
        });
    }
    /**
     * GetObject returns a single object by its ID.
     * @returns v1GetObjectResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static objectsServiceGetObject({
        id,
    }: {
        /**
         * ID of the object to return.
         */
        id: string,
    }): CancelablePromise<v1GetObjectResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/objects/{id}',
            path: {
                'id': id,
            },
        });
    }
}
