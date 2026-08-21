import { createFileRoute } from '@tanstack/react-router';
import { InfoPanel } from '../components/info-panel/info-panel';
import { RtfApp } from '../components/rtf-app';

const MapPage = () => {
    return (
        <div className="relative h-full w-full">
            <RtfApp />
            <InfoPanel />
        </div>
    );
};

export const Route = createFileRoute('/')({
    component: MapPage,
});
