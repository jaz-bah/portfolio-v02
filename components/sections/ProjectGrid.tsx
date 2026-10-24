import React from "react";
import ProjectSmallCard from "../card/ProjectSmallCard";
import "./../../styles/components/projects_tabs.scss";
import Heading from "../others/Heading";
import { projects } from "../../data/projects";

export default function ProjectGrid() {
  return (
    <div className="projects_tabs_section">
      <div className="px-4">
        <Heading title="Projects" />
        <div className="project_grid">
          {projects.map((project) => (
            <ProjectSmallCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
