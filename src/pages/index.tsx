import { createFileRoute } from '@tanstack/react-router';
import { RtfApp } from '../components/rtf-app';

const MapPage = () => {
    return <RtfApp />;
};

export const Route = createFileRoute('/')({
    component: MapPage,
});
