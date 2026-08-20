import { createFileRoute } from '@tanstack/react-router';

const UnauthorizedPage = () => {
    return (
        <div className="flex h-full w-full flex-col gap-4 items-center justify-center bg-[#fffaf0] p-4">
            <div>
                <img src="/images/error.png" />
            </div>
            <div className="text-sm">401 Unauthorized</div>
        </div>
    );
};

export const Route = createFileRoute('/errors/unauthorized/')({
    component: UnauthorizedPage,
});
