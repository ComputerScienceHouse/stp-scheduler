"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItemProps {
    title: string;
    route: string;
}

export default function NavItem(
    navItem: NavItemProps 
    )
{
    const pathname = usePathname();

    return (
    <Link
        data-label={navItem.title}
        href={navItem.route}
        className={`flex-grow bold-pseudo ${pathname === navItem.route ? "font-semibold text-primary" : ""}
                        p-2 pl-4 pr-4`}
    >
        {navItem.title}
    </Link>
    );
}