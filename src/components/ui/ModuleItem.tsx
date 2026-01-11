import StatusPill from './StatusPill';

interface ModuleItemProps {
    name: string;
    status: 'Available' | 'In progress' | 'Planned';
}

export default function ModuleItem({ name, status }: ModuleItemProps) {
    return (
        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <span className="text-gray-700">{name}</span>
            <StatusPill status={status} />
        </div>
    );
}
