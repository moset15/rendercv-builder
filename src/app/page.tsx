"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Loader2, FileDown, Plus, Trash2, ChevronDown, ChevronUp, Palette } from "lucide-react";

// The default data structure for the form
const defaultValues = {
  theme: "classic",
  personal: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    location: "Nairobi, Kenya",
    website: "https://johndoe.com"
  },
  education: [
    {
      institution: "University of Nairobi",
      area: "Computer Science",
      degree: "BSc",
      start_date: "2018-09",
      end_date: "2022-05",
      highlights: "Graduated with First Class Honors."
    }
  ],
  experience: [
    {
      company: "Tech Corp",
      position: "Software Engineer",
      location: "Nairobi",
      start_date: "2022-06",
      end_date: "present",
      highlights: "Built scalable web applications.\nLed a team of 3 developers."
    }
  ],
  athletics: [
    {
      name: "Kitaka 10s Champion",
      details: "Won the tournament with Nondescripts RFC in 2024."
    }
  ]
};

const THEMES = ["classic", "modern", "sb2nov", "engineeringresumes"];

function Accordion({ title, icon, defaultOpen = false, children }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 bg-neutral-900 hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-3 font-bold text-neutral-200">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
      </button>
      {open && <div className="p-4 border-t border-neutral-800 space-y-4">{children}</div>}
    </div>
  );
}

export default function Home() {
  const { register, control, handleSubmit, watch, reset } = useForm({
    defaultValues
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: athFields, append: appendAth, remove: removeAth } = useFieldArray({ control, name: "athletics" });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rendercv-data");
    if (saved) {
      try {
        reset(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data");
      }
    }
  }, [reset]);

  // Save to local storage on change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("rendercv-data", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    try {
      // Map form data to RenderCV schema
      const payload = {
        cv: {
          name: data.personal.name,
          location: data.personal.location,
          email: data.personal.email,
          phone: data.personal.phone,
          website: data.personal.website,
          sections: {
            "Education": data.education.map((edu: any) => ({
              institution: edu.institution,
              area: edu.area,
              degree: edu.degree,
              start_date: edu.start_date,
              end_date: edu.end_date,
              highlights: edu.highlights.split("\n").filter((h: string) => h.trim() !== "")
            })),
            "Experience": data.experience.map((exp: any) => ({
              company: exp.company,
              position: exp.position,
              location: exp.location,
              start_date: exp.start_date,
              end_date: exp.end_date,
              highlights: exp.highlights.split("\n").filter((h: string) => h.trim() !== "")
            })),
            "Athletic Achievements": data.athletics.map((ath: any) => ({
              name: ath.name,
              details: ath.details
            }))
          }
        },
        design: {
          theme: data.theme
        }
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate CV. Please check your inputs.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 flex flex-col lg:flex-row gap-8">
      {/* Editor Pane */}
      <div className="w-full lg:w-1/2 flex flex-col h-[calc(100vh-4rem)]">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight mb-2">RenderCV Builder</h1>
          <p className="text-neutral-400">Production-ready LaTeX portfolio generator.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20 custom-scrollbar">
          
          <Accordion title="Theme Settings" icon={<Palette className="w-5 h-5 text-indigo-400" />} defaultOpen>
            <div>
              <label className="block text-sm mb-1 text-neutral-400">Select Theme</label>
              <select {...register("theme")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-white focus:border-indigo-500 outline-none">
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </Accordion>

          <Accordion title="Personal Information" icon={<div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">PI</div>}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-neutral-400">Full Name</label>
                <input {...register("personal.name")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-neutral-400">Email</label>
                <input {...register("personal.email")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-neutral-400">Phone</label>
                <input {...register("personal.phone")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-neutral-400">Location</label>
                <input {...register("personal.location")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-neutral-400">Website</label>
                <input {...register("personal.website")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-500" />
              </div>
            </div>
          </Accordion>

          <Accordion title="Experience" icon={<div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">EX</div>}>
            {expFields.map((field, index) => (
              <div key={field.id} className="relative p-4 border border-neutral-800 rounded-lg bg-neutral-950 mb-4">
                <button type="button" onClick={() => removeExp(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs mb-1 text-neutral-500">Company</label>
                    <input {...register(`experience.${index}.company`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs mb-1 text-neutral-500">Position</label>
                    <input {...register(`experience.${index}.position`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">Start Date</label>
                    <input {...register(`experience.${index}.start_date`)} placeholder="2022-01" className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">End Date</label>
                    <input {...register(`experience.${index}.end_date`)} placeholder="present" className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs mb-1 text-neutral-500">Highlights (One per line)</label>
                    <textarea {...register(`experience.${index}.highlights`)} rows={3} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => appendExp({ company: "", position: "", location: "", start_date: "", end_date: "", highlights: "" })} className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 flex items-center justify-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </Accordion>

          <Accordion title="Education" icon={<div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">ED</div>}>
             {eduFields.map((field, index) => (
              <div key={field.id} className="relative p-4 border border-neutral-800 rounded-lg bg-neutral-950 mb-4">
                <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="col-span-2">
                    <label className="block text-xs mb-1 text-neutral-500">Institution</label>
                    <input {...register(`education.${index}.institution`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">Area/Major</label>
                    <input {...register(`education.${index}.area`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">Degree</label>
                    <input {...register(`education.${index}.degree`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">Start Date</label>
                    <input {...register(`education.${index}.start_date`)} placeholder="2018-09" className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">End Date</label>
                    <input {...register(`education.${index}.end_date`)} placeholder="2022-05" className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs mb-1 text-neutral-500">Highlights (One per line)</label>
                    <textarea {...register(`education.${index}.highlights`)} rows={2} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => appendEdu({ institution: "", area: "", degree: "", start_date: "", end_date: "", highlights: "" })} className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 flex items-center justify-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </Accordion>

          <Accordion title="Athletic Achievements" icon={<div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">AT</div>}>
             {athFields.map((field, index) => (
              <div key={field.id} className="relative p-4 border border-neutral-800 rounded-lg bg-neutral-950 mb-4">
                <button type="button" onClick={() => removeAth(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">Title / Event</label>
                    <input {...register(`athletics.${index}.name`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-500">Details</label>
                    <input {...register(`athletics.${index}.details`)} className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white outline-none" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => appendAth({ name: "", details: "" })} className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 flex items-center justify-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Achievement
            </button>
          </Accordion>

          {/* Floating Action Button for smaller screens, fixed at bottom for editor */}
          <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent pb-4">
            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-neutral-200 disabled:opacity-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
              {loading ? "Compiling LaTeX..." : "Generate PDF"}
            </button>
          </div>
          
          {error && <div className="text-red-500 mt-4 text-sm bg-red-500/10 p-4 rounded-md border border-red-500/20 whitespace-pre-wrap font-mono">{error}</div>}
        </form>
      </div>
      
      {/* Preview Pane */}
      <div className="w-full lg:w-1/2 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center p-2 h-[calc(100vh-4rem)] relative overflow-hidden shadow-2xl">
        {pdfUrl ? (
          <>
            <iframe src={pdfUrl} className="w-full h-full rounded-xl bg-white" />
            <div className="absolute top-6 right-6 flex gap-2">
               <a href={pdfUrl} download="portfolio.pdf" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 transition-colors">
                 <FileDown className="w-4 h-4" /> Download PDF
               </a>
            </div>
          </>
        ) : (
          <div className="text-neutral-500 flex flex-col items-center max-w-sm text-center">
            <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
               <FileDown className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-300 mb-2">No Preview Available</h3>
            <p className="text-sm">Fill out the form on the left and click Generate. The rendering engine will compile your LaTeX document and display the PDF here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
