import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as API from '../SendToApi';
import { section_data, teacher_data } from "../GetFromApi";
import { getTeacherMentorStatus, getTeacherName, getTeacherSections } from "../HelperFunctions";

interface EditTeacherProps{
    sections: SectionProps[];
    teachers: TeacherProps[];
}

var selectedSections: string[] = [];
var minWeight = "-1";
var maxWeight = "1";

export default function EditTeacher({sections, teachers}: EditTeacherProps){
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [isMentor, setIsMentor] = useState<boolean>(false);
    const [mathWeight, setMathWeight] = useState<number>(0);
    const [englishWeight, setEnglishWeight] = useState<number>(0);
    const [aslWeight, setAslWeight] = useState<number>(0);
    const [collegeReadinessWeight, setCollegeReadinessWeight] = useState<number>(0);
    const [selWeight, setSelWeight] = useState<number>(0);
    const [financialLitWeight, setFinancialLitWeight] = useState<number>(0);
    const [presentationsWeight, setPresentationsWeight] = useState<number>(0);
    const [digitalLitWeight, setDigitalLithWeight] = useState<number>(0);

    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

    function selectTeacher(e: ChangeEvent<HTMLSelectElement>){
        // e.target.value should be the teacher's id.
        setId(e.target.value);
        setName(getTeacherName(teachers, e.target.value));
        setIsMentor(getTeacherMentorStatus(teachers, e.target.value));
        // setMathWeight(getTeacherSubjectWeights(teachers, e.target.value).math);
        // setEnglishWeight(getTeacherSubjectWeights(students, e.target.value).english);
        // setAslWeight(getTeacherSubjectWeights(teachers, e.target.value).asl);
        // setCollegeReadinessWeight(); // the following are unimplemented subjects
        // setSelWeight();
        // setFinancialLitWeight();
        // setPresentationsWeight();
        // setDigitalLithWeight();

        setSelectedSectionIds(getTeacherSections(teachers, e.target.value));
    }

    /**
     * Calls the helper functions that updates the section lists.
     * @param e ChangeEvent<HTMLInputElement>, check event
     * @param value string, the section id
     */
    function updateSections(e: ChangeEvent<HTMLInputElement>, value: string): void {
        if(e.target.checked){
            setSelectedSectionIds(prev => [...prev, value]);
        }
        else{
            setSelectedSectionIds(prev => prev.filter(x => x !== value));
        }
    }
    
    /**
     * Edit a teacher
     * 
     * @param e FormEvent<HTMLFormElement>
     */
    function editTeacher(e: FormEvent<HTMLFormElement>){
        e.preventDefault(); // prevents page reload on form submission
        
        var teacher_id: string = id;
        var teacher_name: string = name;
        var subject_weights: Record<string, number> = {
            "math": mathWeight, 
            "english": englishWeight, 
            "asl": aslWeight, 
            "college readiness": collegeReadinessWeight, 
            "social emotional learning": selWeight, 
            "financial lit": financialLitWeight,
            "presentations": presentationsWeight,
            "digital lit": digitalLitWeight
        };
        var is_mentor: boolean = isMentor;
        var section_ids: string[] = selectedSectionIds;

        console.log("Teacher Creation Initiated: ");
        console.log("teacher_id: " + teacher_id);
        console.log("teacher_name: " + teacher_name);
        console.log("subject_weights: " + JSON.stringify(subject_weights));
        console.log("is_mentor: " + is_mentor);
        console.log("section_ids: " + section_ids);

        API.editTeacher({
            "id": teacher_id,
            "name": teacher_name,
            "subject_weights": subject_weights,
            "is_mentor": is_mentor
        })

        e.currentTarget.reset(); // reset the data
        setId("");
        setName("");
        setIsMentor(false);
        setMathWeight(0); // TODO: Update database to include subjects in such a way that the frontend does not have to know what subjects exists to improve maintainability. As of now, the code would have to be modified to add a new weight.
        setEnglishWeight(0);
        setAslWeight(0);
        setCollegeReadinessWeight(0);
        setSelWeight(0);
        setFinancialLitWeight(0);
        setPresentationsWeight(0);
        setDigitalLithWeight(0);

        setSelectedSectionIds([]);

    }
    
    useEffect(() => {
        console.log("sectionIds changed:", selectedSectionIds);
    }, [selectedSectionIds]);

    return (
        <details className="mb-2">
            <summary className="hover:backdrop-brightness-125 p-4">Edit Instructor (Click to collapse/expand)</summary>
            <div className={"border-2 p-2 m-4 border-white/50"}>
                <form name="editTeacherForm" onSubmit={(e) => editTeacher(e)}>

                    {/* Sets the current instructor to be modified, providing their id */}
                    <select className={"border-2 m-4 pt-4 pb-4 border-white/50"} onChange={(e) => {selectTeacher(e)}}
                        data-tooltip-id="my-tooltip" data-tooltip-content="Select an instructor" >
                        <option className="mb-2 border-b border-white/50 text-gray" value="">
                        ...
                        </option>
                        {Object.entries(teachers).map(([key, teacher]) => {

                            return (
                                <option key={key} className="mb-2 border-b border-white/50 text-black" value={teacher.id}>
                                    {teacher.name} | {teacher.id}   
                                </option>
                            );
                        })
                        }
                    </select>

                    {/* Edit instructor's name */}
                    <br />
                    <input type="text" id="name" className={"ml-4 border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} value={name} onChange={(e) => setName(e.currentTarget.value)}
                        data-tooltip-id="my-tooltip" data-tooltip-content="Edit the instructor's name" />
                    <label className={"p-2 pr-4"} > Instructor Name</label>
                    <br />

                    {/* Edit the instructor's subject preference weights */}
                    <input type="range" min={minWeight} max={maxWeight} id="mathWeight" className={"border-2 p-1 ml-4"} value={mathWeight} onChange={(e) => setMathWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{mathWeight} : Math</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="englishWeight" className={"border-2 p-1 ml-4"} value={englishWeight} onChange={(e) => setEnglishWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{englishWeight} : English</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="aslWeight" className={"border-2 p-1 ml-4"} value={aslWeight} onChange={(e) => setAslWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{aslWeight} : ASL</label>    
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="collegeReadinessWeight" className={"border-2 p-1 ml-4"} value={collegeReadinessWeight} onChange={(e) => setCollegeReadinessWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{collegeReadinessWeight} : College Readiness</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="selWeight" className={"border-2 p-1 ml-4"} value={selWeight} onChange={(e) => setSelWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{selWeight} : Social Emotional Learning</label>
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="financialLitWeight" className={"border-2 p-1 ml-4"} value={financialLitWeight} onChange={(e) => setFinancialLitWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{financialLitWeight} : Financial Literacy</label>    
                    <br />

                    <input type="range" min={minWeight} max={maxWeight} id="presentationsWeight" className={"border-2 p-1 ml-4"} value={presentationsWeight} onChange={(e) => setPresentationsWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{presentationsWeight} : Presentations</label>
                    <br />
                    
                    <input type="range" min={minWeight} max={maxWeight} id="digitalLitWeight" className={"border-2 p-1 ml-4"} value={digitalLitWeight} onChange={(e) => setDigitalLithWeight(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{digitalLitWeight} : Digital Literacy</label> 
                    <br />

                    {/* Edit instructor's mentor status */}
                    <input type="checkbox" id="mentorStatus" className={"scale-150 border-2 p-1 m-4 ml-20 mr-16 hover:backdrop-brightness-125 active:backdrop-brightness-90"} checked={isMentor} onChange={(e) => setIsMentor(e.target.checked)}/>
                    <label className={"p-2 pr-4"} >Mentor Status</label> 
                    <br />
                                            
                    {/* Edit the instructor's sections */}
                    {/* Generate list of all selectable sections */}
                    <details className={"border-2 m-4 pt-4 pb-4 border-white/50"}>
                        <summary className="hover:backdrop-brightness-125 p-4"
                            data-tooltip-id="my-tooltip" data-tooltip-content="Select all sections the instructor will be instructing" 
                        >Sections (Click to collapse/expand)</summary>
                        {Object.entries(sections).map(([key, section]) => {
                            return (
                                <div key={key} className="mb-2 border-b border-white/50">
                                    <input type="checkbox" id={section.id} value={section.id} checked={selectedSectionIds.includes(section.id)} className={"h-4 w-4 ml-8"} onChange={(e) => updateSections(e, e.currentTarget.value)}/>
                                    <label className={"p-2 pr-4 pl-6"} >{section.subject} | {section.level} | {getTeacherName(teachers, section.teacherId)} | {section.id}</label>    
                                </div>
                            );
                        })
                        }
                    </details>
                    <br />

                    {/* Submit data button */}
                    <button type="submit" className={"ml-4 w-35 border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"}>Update</button>
                </form>
                
            </div>
        </details>
    );
}