/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * LoginRequest carries the credentials to authenticate with.
 */
export type v1LoginRequest = {
    /**
     * Email address of the account.
     */
    email?: string;
    /**
     * Plain-text password to verify against the stored bcrypt hash.
     */
    password?: string;
};

