/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { rpcStatus } from '../models/rpcStatus';
import type { v1LoginRequest } from '../models/v1LoginRequest';
import type { v1LoginResponse } from '../models/v1LoginResponse';
import type { v1RegisterRequest } from '../models/v1RegisterRequest';
import type { v1RegisterResponse } from '../models/v1RegisterResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthServiceService {
    /**
     * Login authenticates a user and returns a signed JWT bearer token.
     * @returns v1LoginResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static authServiceLogin({
        body,
    }: {
        /**
         * LoginRequest carries the credentials to authenticate with.
         */
        body: v1LoginRequest,
    }): CancelablePromise<v1LoginResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: body,
        });
    }
    /**
     * Register creates a new user account with the "user" role.
     * @returns v1RegisterResponse A successful response.
     * @returns rpcStatus An unexpected error response.
     * @throws ApiError
     */
    public static authServiceRegister({
        body,
    }: {
        /**
         * RegisterRequest carries the data needed to create an account.
         */
        body: v1RegisterRequest,
    }): CancelablePromise<v1RegisterResponse | rpcStatus> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: body,
        });
    }
}
