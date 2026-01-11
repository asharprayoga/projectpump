'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: Logo and App Info */}
                <div className="flex items-center gap-4">
                    {/* RE Logo */}
                    <Link href="/pumpcalc" className="flex items-center">
                        <Image
                            src="/re-logo.png"
                            alt="Rekayasa Engineering"
                            width={200}
                            height={60}
                            className="h-12 w-auto"
                            priority
                        />
                    </Link>

                    {/* App Name */}
                    <div className="ml-4 pl-4 border-l border-gray-200">
                        <div className="text-re-blue font-semibold">Pump Design Calculator (API 610 / 674 / 675 / 676)</div>
                        <div className="text-gray-500 text-sm">Internal tool • Mechanical Engineering</div>
                        <div className="text-re-orange text-xs">Prototype build • RE Mechanical</div>
                    </div>
                </div>

                {/* Right: Navigation */}
                <nav className="flex items-center gap-2">
                    <Link href="/pumpcalc/saved" className="btn-outline">
                        Proyek Tersimpan
                    </Link>
                    <Link href="/pumpcalc/changelog" className="btn-outline">
                        Changelog
                    </Link>
                    <Link href="/pumpcalc/roadmap" className="btn-outline">
                        Roadmap
                    </Link>
                    <Link href="/pumpcalc/internal" className="btn-outline">
                        Internal RE
                    </Link>
                </nav>
            </div>
        </header>
    );
}
