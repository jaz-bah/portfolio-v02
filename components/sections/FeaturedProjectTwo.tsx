import { AnimatedSlides } from "../animations/AnimatedSlides";
import Heading from "../others/Heading";
import "./../../styles/components/featured_project_two.scss";
import { featuredProjects } from "../../data/featured-projects";

export default function FeaturedProjectTwo() {
  return (
    <div className="jb_featured_project_two">
      <div className="container mx-auto px-4">
        <Heading title="Featured Projects" link="/projects" />
        <div className="pt-10 md:pt-20">
          <AnimatedSlides slides={featuredProjects} />
        </div>
      </div>
    </div>
  );
}
