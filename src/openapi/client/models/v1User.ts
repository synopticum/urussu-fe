/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * User is the public view of an account — no password hash.
 */
export type v1User = {
    /**
     * Unique ID of the user (UUID).
     */
    id?: string;
    /**
     * Email address of the user.
     */
    email?: string;
    /**
     * Access level of the user ("user" or "admin").
     */
    role?: string;
    /**
     * Given name of the user.
     */
    firstName?: string;
    /**
     * Family name of the user.
     */
    lastName?: string;
};

