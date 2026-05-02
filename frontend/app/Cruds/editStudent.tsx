import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as API from '../SendToApi';
import { getStudentById, getStudentName, getStudentSections, getStudentSubjectRankings, getTeacherName } from "../HelperFunctions";

interface EditStudentProps{
    sections: SectionProps[];
    students: StudentProps[];
    teachers: TeacherProps[];
}

/**
 * The sections selected by the user
 */
var selectedSections: string[] = [];
var minRank = "0";
var maxRank = "10";

// TODO: update to require passing in all students, teachers, and sections so this file is not responsible for retreiving the global data.
export default function EditStudent({sections, students, teachers}: EditStudentProps){
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [mathScore, setMathScore] = useState<number>(5);
    const [englishScore, setEnglishScore] = useState<number>(5);
    const [aslScore, setAslScore] = useState<number>(5);

    const [subjectRankings, setSubjectRankings] = useState<Record<string, number>>({"math": 5, "english": 5, "asl": 5});
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

    function selectStudent(e: ChangeEvent<HTMLSelectElement>){
        // e.target.value should be the student's id.
        setId(e.target.value);
        setName(getStudentName(students, e.target.value));
        setMathScore(getStudentSubjectRankings(students, e.target.value).math);
        setEnglishScore(getStudentSubjectRankings(students, e.target.value).english);
        setAslScore(getStudentSubjectRankings(students, e.target.value).asl);

        setSelectedSectionIds(getStudentSections(students, e.target.value));
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
     * Edit a student
     * 
     * @param e FormEvent<HTMLFormElement>
     */
    function editStudent(e: FormEvent<HTMLFormElement>){
        e.preventDefault(); // prevents page reload on form submission
        
        var student_id: string = id;
        var student_name: string = name;
        var subject_rankings: Record<string, number> = {
            "math": mathScore, 
            "english": englishScore, 
            "asl": aslScore};
        var selected_section_ids: string[] = selectedSectionIds;

        // logs for testing
        console.log("Student Creation Initiated: ");
        console.log("student_id: " + student_id);
        console.log("student_name: " + student_name);
        console.log("subject_abilities: " + JSON.stringify(subject_rankings));
        console.log("section_ids: " + selected_section_ids);

        API.editStudent({
            "id": student_id,
            "name": student_name,
            "subject_abilities": subject_rankings,
            "section_ids": selected_section_ids
        })

        e.currentTarget.reset(); // reset the data
        setId("");
        setName("");
        setMathScore(5); // TODO: Update database to include subjects in such a way that the frontend does not have to know what subjects exists to improve maintainability. As of now, the code would have to be modified to add a new score.
        setEnglishScore(5);
        setAslScore(5);
        
        setSelectedSectionIds([]);
    }

    useEffect(() => {
        console.log("selectedSectionIds changed:", selectedSectionIds);
    }, [selectedSectionIds]);


    return (
        <details className="mb-2">
            <summary className="hover:backdrop-brightness-125 p-4"> Edit Student (Click to collapse/expand)</summary>
            <div className={"border-2 p-4 m-4 ml-0 border-white/50"}>
                <form name="editStudentForm" onSubmit={(e) => editStudent(e)}>
                    {/* Sets the current student to be modified, providing their id */}
                    <select className={"border-2 m-4 pt-4 pb-4 border-white/50"} onChange={(e) => {selectStudent(e)}}
                        data-tooltip-id="my-tooltip" data-tooltip-content="Select a Student" >
                        <option className="mb-2 border-b border-white/50 text-gray" value="">
                        ...
                        </option>
                        {Object.entries(students).map(([key, student]) => {
                            return (
                                <option key={key} className="mb-2 border-b border-white/50 text-black" value={student.id}>
                                    {student.name} | {student.id}   
                                </option>
                            );
                        })
                        }
                    </select>

                    {/* Edit the student's name */}
                    <br />
                    <input type="text" id="name" className={"ml-4 border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} value={name} onChange={(e) => setName(e.currentTarget.value)}
                        data-tooltip-id="my-tooltip" data-tooltip-content="Edit the student's name" />
                    <label className={"p-2 pr-4"} >Student Name</label>
                    <br />

                    {/* Edit the student's scores */}
                    <input type="range" min={minRank} max={maxRank} id="mathRank" className={"border-2 p-1 ml-4"} value={mathScore} onChange={(e) => setMathScore(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{mathScore} : Math Ability Level</label>
                    <br />
                    <input type="range" min={minRank} max={maxRank} id="englishRank" className={"border-2 p-1 ml-4"} value={englishScore} onChange={(e) => setEnglishScore(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{englishScore} : English Ability Level</label>
                    <br />
                    <input type="range" min={minRank} max={maxRank} id="aslRank" className={"border-2 p-1 ml-4"} value={aslScore} onChange={(e) => setAslScore(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4 "} >{aslScore} : ASL Ability Level</label>    
                    <br />

                    {/* Edit the student's sections */}
                    <label className={"p-2 pr-4"} >Sections:</label> 
                        {/* Generate list of all selectable sections */}
                    <details className={"border-2 m-4 pt-4 pb-4 border-white/50"}>
                        <summary className="hover:backdrop-brightness-125 p-4"
                            data-tooltip-id="my-tooltip" data-tooltip-content="Select all sections the student will be attending" 
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

                    {/* Submit data button */}
                    <button type="submit" className={"border-2 p-1 ml-4 w-35 hover:backdrop-brightness-125 active:backdrop-brightness-90"}>Update</button>
                </form>
            </div>
        </details>
    );
}