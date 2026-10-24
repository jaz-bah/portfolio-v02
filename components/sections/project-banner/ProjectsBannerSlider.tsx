import Image from 'next/image'
import Link from 'next/link'
import "./../../../styles/components/projects_banner.scss";
import { Marquee } from '../../animations/Marquee';
import { shopifyProjects } from "../../../data/shopify-projects";

export default function ProjectsBannerSlider() {
    return (
        <section className='projects_banner_section projects_banner_section_slider'>
            <div className="slider_container">
                <Marquee repeat={1} reverse={false} className="slider_content [--duration:100s]">
                    {shopifyProjects && shopifyProjects.map((project, index) => project.image_1 ? (
                        <Link href={project.link} key={index}>
                            <div className="imgbox_full">
                                <Image
                                    src={project.image_1}
                                    alt="image"
                                    style={{
                                        aspectRatio:
                                            Math.random() > 0.5
                                                ? `${Math.random() * 1 + 1} / 1`
                                                : `1 / ${Math.random() * 1 + 1}`,
                                    }}
                                    width={200}
                                    height={200}
                                />
                            </div>
                        </Link>
                    ) : (
                        <Link href={project.link} key={index}>
                            <video autoPlay muted loop>
                                <source src={""} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </Link>
                    ))}
                </Marquee>
            </div>

            <div className="text_box">
                <h2 className="title">Build 100+ Shopify Stores</h2>
            </div>
        </section>
    )
}
