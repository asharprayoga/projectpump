interface StepCardProps {
    number: string;
    title: string;
    description: string;
    onClick?: () => void;
}

export default function StepCard({ number, title, description, onClick }: StepCardProps) {
    return (
        <div
            className="step-card flex items-start gap-4"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-re-blue">{title}</h3>
                    <span className="text-re-yellow font-bold text-lg">{number}</span>
                </div>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
        </div>
    );
}
