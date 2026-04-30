import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as API from '../SendToApi';

interface CreateTeacherProps{
    scheduleSections: string[];
}

var minWeight = "-1";
var maxWeight = "1";

export default function CreateTeacher({scheduleSections}: CreateTeacherProps){
    const [name, setName] = useState<string>("no_name");
    const [isMentor, setIsMentor] = useState<boolean>(false);
    const [mathWeight, setMathWeight] = useState<number>(0);
    const [englishWeight, setEnglishWeight] = useState<number>(0);
    const [aslWeight, setAslWeight] = useState<number>(0);
    const [collegeReadinessWeight, setCollegeReadinessWeight] = useState<number>(0);
    const [selWeight, setSelWeight] = useState<number>(0);
    const [financialLitWeight, setFinancialLitWeight] = useState<number>(0);
    const [presentationsWeight, setPresentationsWeight] = useState<number>(0);
    const [digitalLitWeight, setDigitalLithWeight] = useState<number>(0);

    const [sectionIds, setSectionIds] = useState<string[]>([]);

    // TODO: This code is used in a lot of places for selecting sections and should be turned into a helper class
    /**
     * Calls the helper functions that updates the section lists.
     * @param e ChangeEvent<HTMLInputElement>, check event
     * @param value string, the section id
     */
    function updateSections(e: ChangeEvent<HTMLInputElement>, value: string): void {
        if(e.target.checked){
            setSectionIds(prev => [...prev, value]);
        }
        else{
            setSectionIds(prev => prev.filter(x => x !== value));
        }
    }

    /**
     * Create a teacher
     * 
     * @param e FormEvent<HTMLFormElement>
     * @param teacher_name 
     * @param subject_weights 
     * @param is_mentor 
     */
    function createTeacher(e: FormEvent<HTMLFormElement>, teacher_name: string = "", subject_weights: Record<string, number> = {}, is_mentor: boolean = false, section_ids: string[] = []){
        e.preventDefault(); // prevents page reload on form submission
        
        teacher_name = name;
        subject_weights = {
            "math": mathWeight, 
            "english": englishWeight, 
            "asl": aslWeight, 
            "college readiness": collegeReadinessWeight, 
            "social emotional learning": selWeight, 
            "financial lit": financialLitWeight,
            "presentations": presentationsWeight,
            "digital lit": digitalLitWeight
        };
        is_mentor = isMentor;
        section_ids = sectionIds;

        console.log("Teacher Creation Initiated: ");
        console.log("teacher_name: " + teacher_name);
        console.log("subject_weights: " + JSON.stringify(subject_weights));
        console.log("is_mentor: " + is_mentor);
        console.log("section_ids: " + section_ids);

        API.createTeacher({
            "name": teacher_name,
            "subject_weights": subject_weights,
            "is_mentor": is_mentor
            // "section_ids": section_ids
        })

        e.currentTarget.reset(); // reset the data
        setName("no_name");
        setIsMentor(false);
        setMathWeight(0);
        setEnglishWeight(0);
        setAslWeight(0);
        setCollegeReadinessWeight(0);
        setSelWeight(0);
        setFinancialLitWeight(0);
        setPresentationsWeight(0);
        setDigitalLithWeight(0);
        setSectionIds([]);

    }
        useEffect(() => {
            console.log("sectionIds changed:", sectionIds);
        }, [sectionIds]);
    
    return (
        <details className="mb-2">
            <summary className="hover:backdrop-brightness-125 p-4">Create Instructor (Click to collapse/expand)</summary>
            <div className={"border-2 p-2 m-4 border-white/50"}>
                <form name="createTeacherForm" onSubmit={(e) => createTeacher(e)}>
                    <br />
                    <input type="text" id="name" className={"ml-4 border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} onChange={(e) => setName(e.currentTarget.value)}
                        data-tooltip-id="my-tooltip" data-tooltip-content="Enter new student's name" />
                    <label className={"p-2 pr-4"} > Instructor Name</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="mathWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setMathWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{mathWeight} : Math</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="englishWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setEnglishWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{englishWeight} : English</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="aslWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setAslWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{aslWeight} : ASL</label>    
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="collegeReadinessWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setCollegeReadinessWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{collegeReadinessWeight} : College Readiness</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="selWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setSelWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{selWeight} : Social Emotional Learning</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="financialLitWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setFinancialLitWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{financialLitWeight} : Financial Literacy</label>    
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="presentationsWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setPresentationsWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{presentationsWeight} : Presentations</label>
                    <br />
                    
                    <input type="range" min={minWeight} max={maxWeight} id="digitalLitWeight" className={"border-2 p-1 ml-4"} onChange={(e) => setDigitalLithWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{digitalLitWeight} : Digital Literacy</label> 
                    <br />

                    <input type="checkbox" id="mentorStatus" className={"scale-150 border-2 p-1 m-4 ml-20 mr-16 hover:backdrop-brightness-125 active:backdrop-brightness-90"} onChange={(e) => setIsMentor(e.target.checked)}/>
                    <label className={"p-2 pr-4"} >Mentor Status</label> 
                    <br />

                    {/* Generate list of all selectable sections */}
                    {/* UNUSED as backend has not implemented creating instructors with sections */}
                    {/* <div className={"border-2 m-4 pt-4 pb-4 border-white/50"}>
                        {Object.entries(scheduleSections).map(([key, value]) => {

                            // incrementSectionCount();
                            // const [day, timeBlockId] = key.split("-");
                            return (
                                <div key={key} className="mb-2 border-b border-white/50">
                                    <input type="checkbox" id={value} value={value} checked={sectionIds.includes(value)} className={"h-4 w-4 ml-8"} onChange={(e) => updateSections(e, e.currentTarget.value)}/>
                                    <label className={"p-2 pr-4 pl-6"} >{value}</label>    
                                </div>
                            );
                        })
                        }
                    </div> */}
                    <br />
                    <button type="submit" className={"ml-4 w-35 border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"}>Create</button>
                </form>
                
            </div>
        </details>
    );
}