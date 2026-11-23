"use client";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaFacebookSquare, FaGithub, FaLinkedin, FaTwitterSquare, FaWhatsapp } from "react-icons/fa";
import Button from "../others/Button";
import Heading from "../others/Heading";
import "./../../styles/components/contact.scss";

type FormState = {
  name: string;
  subject: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
      setForm({ name: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send.");
    }
  };

  return (
    <section className="contact_section h-screen">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 gap-12">
          <div className="contact_info">
            <Heading title="Contact" />

            <ul className="contact_list">
              <li>
                <div className="contact_icon">
                  <Phone />
                </div>
                <div className="contact_text">
                  <h4>Phone</h4>
                  <p >
                    <Link href="tel:+880 1318 106433">+880 1318 106433</Link>
                  </p>
                </div>
              </li>
              <li>
                <div className="contact_icon">
                  <Mail />
                </div>
                <div className="contact_text">
                  <h4>Email</h4>
                  <p >
                    <Link href="mailto:jazbahulalam@example.com">jazbahulalam@example.com</Link>
                  </p>
                </div>
              </li>
              <li>
                <div className="contact_icon">
                  <MapPin />
                </div>
                <div className="contact_text">
                  <h4>Location</h4>
                  <p>Dhaka, Bangladesh</p>
                </div>
              </li>
            </ul>

            <ul className="social">
              <li >
                <Link href="https://www.facebook.com/share/16Q1cjRwCVR/" target="_blank">
                  <FaFacebookSquare />
                </Link>
              </li>
              <li >
                <Link href="https://www.linkedin.com/in/jazbah" target="_blank">
                  <FaLinkedin />
                </Link>
              </li>
              <li >
                <Link href="https://wa.me/8801939127879?text=Hi" target="_blank">
                  <FaWhatsapp />
                </Link>
              </li>
              <li >
                <Link href="https://github.com/jaz-bah" target="_blank">
                  <FaGithub />
                </Link>
              </li>
            </ul>
          </div>
          <div className="contact_form">
            <form onSubmit={handleSubmit}>
              <div className="input_wrapper">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="name">Name</label>
                <div className="bottom_bar"></div>
              </div>
              <div className="input_wrapper">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="subject">Subject</label>
                <div className="bottom_bar"></div>
              </div>
              <div className="input_wrapper">
                <textarea
                  name="message"
                  cols={10}
                  rows={10}
                  placeholder="Message"
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
                <label htmlFor="message">Message</label>
                <div className="bottom_bar"></div>
              </div>

              <Button>
                {status === "loading" ? "Sending..." : "Send"}
              </Button>

              {status === "success" && (
                <p className="form_success mt-4">Message sent successfully!</p>
              )}
              {status === "error" && <p className="form_error mt-4">{errorMsg}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}