import { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: ReactNode;
    href?: string;
    fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
};

export default function Button({
    variant = 'primary',
    children,
    href,
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const classes = `${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
