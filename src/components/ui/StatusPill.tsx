type StatusType = 'Available' | 'In progress' | 'Planned';

interface StatusPillProps {
    status: StatusType;
}

const statusLabels: Record<StatusType, string> = {
    'Available': 'Tersedia',
    'In progress': 'Dalam Proses',
    'Planned': 'Direncanakan',
};

const statusClasses: Record<StatusType, string> = {
    'Available': 'status-available',
    'In progress': 'status-in-progress',
    'Planned': 'status-planned',
};

export default function StatusPill({ status }: StatusPillProps) {
    return (
        <span className={statusClasses[status]}>
            {statusLabels[status]}
        </span>
    );
}
