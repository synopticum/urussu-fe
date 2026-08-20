/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * RegisterRequest carries the data needed to create an account.
 */
export type v1RegisterRequest = {
    /**
     * Email address of the new account (case-insensitive, stored lowercased).
     */
    email?: string;
    /**
     * Plain-text password, stored only as a bcrypt hash. Minimum 8 characters.
     */
    password?: string;
    /**
     * Given name of the user.
     */
    firstName?: string;
    /**
     * Family name of the user.
     */
    lastName?: string;
};

