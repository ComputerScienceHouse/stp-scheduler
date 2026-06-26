/**
 * File: stp-scheduler/frontend/app/Components/Navitem.tsx
 * Author: Addison A (ShadowArcher289)
 * Created: i need to check :(
 * Last Updated: 06/26/2026
 * 
 * Editors:
 *  
 * Summary: component for an item in the navbar that links to another page.
 */

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
        className={`grow bold-pseudo ${pathname === navItem.route ? "font-semibold text-primary" : ""}
                        p-2 pl-4 pr-4`}
    >
        {navItem.title}
    </Link>
    );
}