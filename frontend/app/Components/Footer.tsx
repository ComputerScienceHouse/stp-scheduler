
export default function Footer() {

    return(
        <footer className={"flex justify-end p-3 pt-10 pb-10 bg-[#f76902] text-white pr-5 items-center"}>
            <div className="w-full justify-start inline-flex gap-14 ml-8">
                <ul>
                    <li><b>Developers:</b></li>
                    <li>Logan Endes</li>
                    <li>Addison Asuncion</li>
                </ul>
                <ul>
                    <li><b>Student Transition Program:</b></li>
                    <li><a href="https://www.rit.edu/ntid/stp"><u>www.rit.edu/ntid/stp</u></a></li>
                </ul>
            </div>
            <a href="https://www.csh.rit.edu/"><img src={"/csh_logo_square.svg"} width={"100px"} height={"100px"} className="m-4 mr-8"></img></a>
        </footer>
    );
}