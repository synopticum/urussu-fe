import { proxy } from 'valtio';
import { appStore } from '../../../stores/app';

export const MAX_BODY_LENGTH = 240;

class State {
    body = '';
    serverError: string | null = null;

    get isTooLong(): boolean {
        return this.body.length > MAX_BODY_LENGTH;
    }

    get isEmpty(): boolean {
        return this.body.trim().length === 0;
    }

    get isValid(): boolean {
        return !this.isEmpty && !this.isTooLong;
    }

    async onSubmit(): Promise<void> {
        if (!this.isValid) return;

        this.serverError = null;

        try {
            await appStore.addComment(this.body.trim());
            this.body = '';
        } catch (error) {
            this.serverError = error instanceof Error ? error.message : 'Что-то пошло не так';
        }
    }
}

export const state = proxy(new State());
