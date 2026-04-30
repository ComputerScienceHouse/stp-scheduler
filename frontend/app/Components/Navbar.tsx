import NavItem, { NavItemProps } from "./Navitem";

const navItems: NavItemProps[] = [
    {
        title: "Home",
        route: "/",
    },
    {
        title: "Management",
        route: "/management",
    },
    {
        title: "Students",
        route: "/students",
    },
    {
        title: "Instructors",
        route: "/instructors",
    },
    {
        title: "Sections",
        route: "/sections",
    }
];

export default function Navbar(){

    return (
        <div className={"flex justify-end p-3 pt-5 pb-5 mb-2 border-b-2 bg-[#f76902] text-white pr-5 items-center"}>
            <div className="w-full justify-start pl-8 p-2 text-2xl font-bold"><a href="/">Student Transition Program Scheduler</a></div>

            <div className="hidden md:visible md:inline-flex p-1 pl-4 pr-4 border-2 rounded">
                <ul className="inline-flex flex-row flex-nowrap justify-between text-center text-base">
                    {navItems.map((navItem, index) => (
                        <li className="flex flex-row justify-center items-center" key={index}>
                            | {<NavItem key={index} {...navItem} />}
                        </li>
                    ))}
                    <li className="flex flex-row justify-center items-center">|</li>
                </ul>
            </div>
        </div>
    );
}