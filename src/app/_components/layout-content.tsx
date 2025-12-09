"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide sidebar on auth pages
    const isAuthPage = pathname.startsWith("/auth");

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />
            <div className="ml-64">{children}</div>
        </>
    );
}
