import { createFileRoute } from '@tanstack/react-router';
import { EntityDetails } from '@/components/entity-details';
import { RtfApp } from '@/components/rtf-app';

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
