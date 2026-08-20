/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * LoginResponse returns the token to send as "Authorization: Bearer <token>".
 */
export type v1LoginResponse = {
    /**
     * Signed JWT with sub/role/iat/exp claims.
     */
    token?: string;
};

