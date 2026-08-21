import { proxy } from 'valtio';

export const MAX_BODY_LENGTH = 240;

class State {
    body = '';

    get isTooLong(): boolean {
        return this.body.length > MAX_BODY_LENGTH;
    }

    get isEmpty(): boolean {
        return this.body.trim().length === 0;
    }

    get isValid(): boolean {
        return !this.isEmpty && !this.isTooLong;
    }

    onSubmit(): void {
        if (!this.isValid) return;

        // TODO: send the comment to the server once the API is ready.
        this.body = '';
    }
}

export const state = proxy(new State());
