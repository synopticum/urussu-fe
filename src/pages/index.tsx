import { createFileRoute } from '@tanstack/react-router';
import { RtfApp, EntityDetails } from '@/components';

const MapPage = () => {
    return (
        <div className="relative h-full w-full">
            <RtfApp />
            <EntityDetails />
        </div>
    );
};

export const Route = createFileRoute('/')({
    component: MapPage,
});
