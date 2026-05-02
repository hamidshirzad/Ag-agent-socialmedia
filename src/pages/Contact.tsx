import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { Meta } from "../components/Meta";
import { cn } from "../lib/utils";

interface FormFields {
  name: string;
  email: string;
  message: string;
}
interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function encode(data: Record<string, string>) {
  return new URLSearchParams(data).toString();
}

export default function Contact() {
  const navigate = useNavigate();
  const [fields, setFields]   = useState<FormFields>({ name: "", email: "", message: "" });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!fields.name.trim())    e.name = "Name is required.";
    if (!fields.email.trim())   e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = "Enter a valid email address.";
    if (!fields.message.trim()) e.message = "Message is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "contact",
          ...fields,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong — please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
  };

  return (
    <div className="bg-sb-cream min-h-screen">
      <Meta title="Contact" description="Get in touch with the Fourdoor AI team." />

      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6 bg-white sb-shadow-nav sticky top-0 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-4 group"
          aria-label="Back to home"
        >
          <div className="w-12 h-12 bg-sb-green rounded-full flex items-center justify-center shrink-0 group-hover:bg-sb-house transition-colors">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="font-bold text-2xl tracking-sb text-sb-green uppercase">Fourdoor</span>
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[1.4rem] font-bold text-black/40 hover:text-sb-green transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </nav>

      {/* Hidden form for Netlify build-bot detection */}
      <form name="contact" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
        <input type="text"     name="name" />
        <input type="email"    name="email" />
        <textarea             name="message" />
      </form>

      <main className="max-w-[64rem] mx-auto px-8 py-24">
        <header className="mb-16 text-center">
          <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-4 uppercase">Get in Touch</h1>
          <p className="text-black/40 text-[1.6rem] font-medium italic">
            Questions, partnership enquiries, or just want to say hello — we read every message.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[12px] sb-shadow-card p-16 text-center"
            >
              <div className="w-24 h-24 bg-sb-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} className="text-sb-accent" />
              </div>
              <h2 className="text-[3.2rem] font-bold text-sb-green uppercase tracking-widest mb-4">Message Sent</h2>
              <p className="text-[1.6rem] text-black/40 italic mb-12">We'll get back to you within one business day.</p>
              <button
                onClick={() => navigate("/")}
                className="px-12 py-5 bg-sb-house text-white rounded-full font-black uppercase tracking-widest text-[1.4rem] hover:bg-sb-green transition-all focus:ring-2 focus:ring-sb-house focus:ring-offset-2 outline-none"
              >
                Back to Home
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-[12px] sb-shadow-card p-12">
                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-8"
                >
                  {/* Netlify required hidden field */}
                  <input type="hidden" name="form-name" value="contact" />

                  {/* Honeypot — hidden from real users, bots fill it out */}
                  <p style={{
                    position: "absolute", overflow: "hidden",
                    clip: "rect(0 0 0 0)", height: 1, width: 1,
                    margin: -1, padding: 0, border: 0,
                  }}>
                    <label>
                      Don't fill this out if you're human:
                      <input name="bot-field" tabIndex={-1} autoComplete="off" />
                    </label>
                  </p>

                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 mb-3 px-2">
                      Your Name <span className="text-sb-accent">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={fields.name}
                      onChange={set("name")}
                      placeholder="Jane Smith"
                      autoComplete="name"
                      className={cn(
                        "w-full px-8 py-5 bg-sb-cream border-2 rounded-[12px] text-[1.4rem] font-bold transition-all outline-none focus:ring-2 focus:ring-sb-accent/30",
                        errors.name ? "border-red-400 focus:border-red-400" : "border-transparent focus:border-sb-accent focus:bg-white"
                      )}
                    />
                    {errors.name && <p className="mt-2 px-2 text-[1.1rem] text-red-500 font-bold">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 mb-3 px-2">
                      Email Address <span className="text-sb-accent">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={fields.email}
                      onChange={set("email")}
                      placeholder="jane@company.com"
                      autoComplete="email"
                      className={cn(
                        "w-full px-8 py-5 bg-sb-cream border-2 rounded-[12px] text-[1.4rem] font-bold transition-all outline-none focus:ring-2 focus:ring-sb-accent/30",
                        errors.email ? "border-red-400 focus:border-red-400" : "border-transparent focus:border-sb-accent focus:bg-white"
                      )}
                    />
                    {errors.email && <p className="mt-2 px-2 text-[1.1rem] text-red-500 font-bold">{errors.email}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 mb-3 px-2">
                      Message <span className="text-sb-accent">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={fields.message}
                      onChange={set("message")}
                      placeholder="Tell us how we can help..."
                      rows={6}
                      className={cn(
                        "w-full px-8 py-5 bg-sb-cream border-2 rounded-[12px] text-[1.4rem] font-bold transition-all outline-none focus:ring-2 focus:ring-sb-accent/30 resize-y min-h-[14rem]",
                        errors.message ? "border-red-400 focus:border-red-400" : "border-transparent focus:border-sb-accent focus:bg-white"
                      )}
                    />
                    {errors.message && <p className="mt-2 px-2 text-[1.1rem] text-red-500 font-bold">{errors.message}</p>}
                  </div>

                  {serverError && (
                    <p className="text-[1.3rem] text-red-500 font-bold px-2">{serverError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 bg-sb-house text-white rounded-full font-black uppercase tracking-[0.15em] text-[1.6rem] flex items-center justify-center gap-4 hover:bg-sb-green hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 focus:ring-2 focus:ring-sb-house focus:ring-offset-2 outline-none"
                  >
                    {submitting
                      ? <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      : <Send size={20} />}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
