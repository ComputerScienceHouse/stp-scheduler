"use client";

import { useEffect, useState } from "react";
import * as GetAPI from "../GetFromApi";
import type { SectionProps } from "../SectionProps";

export default function SectionsPage() {
  const [sectionData, setSectionData] = useState<SectionProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await GetAPI.getFromBackendApi("Sections");
      setSectionData(GetAPI.section_data);
    };

    fetchData();
  }, []);

  return (
    <div className="text-black content-center">
      <h2 className=" text-end pr-8 mt-4 mb-1 text-lg">
        <b>{sectionData.length}</b> Total Sections
      </h2>
      <ul
        className="flex flex-wrap w-dvw justify-left list-decimal p-4 pl-16"
        style={{ overflowY: "auto", overflowX: "clip", height: "80vh" }}
      >
        {sectionData.map((section) => (
          <li key={section.id} className="m-6 mt-1 mb-1 pl-1 pr-1 text-xs">
            <b>id: | subject: | level: | days:</b> <br />
            {section.id}
            <br />
            {section.subject}
            <br />
            {section.level}
            <br />
            {section.days}
            <br />
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
}
