"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, FileDown } from "lucide-react";

export default function Home() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      location: "Nairobi, Kenya"
    }
  });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    try {
      const payload = {
        cv: {
          name: data.name,
          location: data.location,
          email: data.email,
          phone: data.phone,
          sections: {
            "Athletic Achievements": [
              "Kitaka 10s Champion - 2024",
              "Kenya Cup Semi-Finalist"
            ]
          }
        }
      };

      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 flex gap-8">
      <div className="w-1/2 max-w-xl h-[calc(100vh-4rem)] overflow-y-auto pr-4">
        <h1 className="text-3xl font-bold mb-2">RenderCV Builder</h1>
        <p className="text-neutral-400 mb-8">Generate a beautiful, LaTeX-powered CV directly in your browser.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <div>
            <label className="block text-sm mb-1 text-neutral-400">Full Name</label>
            <input {...register("name")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-neutral-400">Email</label>
            <input {...register("email")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-neutral-400">Location</label>
            <input {...register("location")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-neutral-400">Phone</label>
            <input {...register("phone")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-md mt-6 flex justify-center items-center gap-2 hover:bg-neutral-200 disabled:opacity-50 transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            {loading ? "Generating PDF (LaTeX)..." : "Generate CV"}
          </button>
          
          {error && <div className="text-red-500 mt-4 text-sm bg-red-500/10 p-4 rounded-md border border-red-500/20 whitespace-pre-wrap font-mono">{error}</div>}
        </form>
      </div>
      
      <div className="w-1/2 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-center p-2 h-[calc(100vh-4rem)]">
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full rounded-lg bg-white" />
        ) : (
          <div className="text-neutral-500 flex flex-col items-center">
            <FileDown className="w-12 h-12 mb-4 opacity-50" />
            <p>Fill out the form and click Generate to preview your CV here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
