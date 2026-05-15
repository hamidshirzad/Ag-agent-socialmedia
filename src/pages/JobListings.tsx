import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Briefcase, Zap, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { generateJobListings } from "../services/geminiService";

type Engine = 'gemini' | 'anthropic' | 'openai';

interface JobResult {
  job_categories: string[];
  jobs: { company_name: string; role: string }[];
}

export default function JobListings() {
  const { profile } = useAuth();
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("Senior");
  const [count, setCount] = useState(10);
  const [engine, setEngine] = useState<Engine>("gemini");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<JobResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.apiKeys?.[engine]) {
      alert(`No ${engine} API key found. Add it in Engine Settings.`);
      return;
    }
    setIsGenerating(true);
    try {
      const data = await generateJobListings(industry, seniority, count, profile.apiKeys, engine);
      setResult(data as JobResult);
    } catch (err: any) {
      alert(err.message || "Generation failed. Check your API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  const engines: Engine[] = ["gemini", "anthropic", "openai"];

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex justify-between items-end mb-16 pb-8 border-b border-black/10">
          <div>
            <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">Job Signal</h1>
            <p className="text-[1.6rem] text-black/50 font-medium">AI-Generated Job Market Intelligence</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-[12px] sb-shadow-card overflow-hidden">
            <div className="p-8 border-b border-black/5 bg-sb-ceramic">
              <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest flex items-center gap-3">
                <Briefcase size={18} /> Signal Parameters
              </h3>
            </div>
            <form onSubmit={handleGenerate} className="p-8 space-y-8">
              <div>
                <label className="block text-[1.2rem] font-bold uppercase tracking-widest text-black/50 mb-3">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. SaaS, Fintech, Healthcare..."
                  required
                  className="w-full bg-sb-cream border border-black/10 rounded-[8px] px-6 py-4 text-[1.4rem] font-medium focus:outline-none focus:border-sb-green transition-colors"
                />
              </div>

              <div>
                <label className="block text-[1.2rem] font-bold uppercase tracking-widest text-black/50 mb-3">Seniority Level</label>
                <select
                  value={seniority}
                  onChange={e => setSeniority(e.target.value)}
                  className="w-full bg-sb-cream border border-black/10 rounded-[8px] px-6 py-4 text-[1.4rem] font-medium focus:outline-none focus:border-sb-green transition-colors"
                >
                  {["Entry Level", "Mid Level", "Senior", "Lead / Principal"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[1.2rem] font-bold uppercase tracking-widest text-black/50 mb-3">Number of Listings</label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full bg-sb-cream border border-black/10 rounded-[8px] px-6 py-4 text-[1.4rem] font-medium focus:outline-none focus:border-sb-green transition-colors"
                >
                  {[5, 10, 20].map(n => (
                    <option key={n} value={n}>{n} listings</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[1.2rem] font-bold uppercase tracking-widest text-black/50 mb-3">AI Engine</label>
                <div className="flex gap-3">
                  {engines.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEngine(e)}
                      className={`flex-1 py-3 rounded-[8px] text-[1.2rem] font-bold uppercase tracking-widest transition-all ${
                        engine === e
                          ? "bg-sb-house text-white shadow-md"
                          : "bg-sb-cream text-black/40 hover:text-sb-green border border-black/10"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !industry.trim()}
                className="w-full py-5 bg-sb-accent text-white font-bold text-[1.4rem] uppercase tracking-widest rounded-[8px] sb-shadow-frap sb-button-active flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin" /> Generating...</>
                ) : (
                  <><Zap size={20} className="fill-white" /> Generate Listings</>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-[12px] sb-shadow-card overflow-hidden">
              <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                <h3 className="text-sb-green font-bold text-[1.4rem] uppercase tracking-widest flex items-center gap-3">
                  <Briefcase size={18} className="fill-sb-green" /> Signal Output
                </h3>
                <span className="text-[1rem] bg-sb-house text-white px-3 py-1 sb-pill font-black tracking-widest uppercase">
                  {result.jobs?.length ?? 0} Jobs
                </span>
              </div>

              <div className="p-8 space-y-8">
                {result.job_categories?.length > 0 && (
                  <div>
                    <p className="text-[1.1rem] font-bold uppercase tracking-widest text-black/40 mb-4">Categories</p>
                    <div className="flex flex-wrap gap-3">
                      {result.job_categories.map(cat => (
                        <span key={cat} className="px-4 py-2 bg-sb-green/10 text-sb-green text-[1.1rem] font-bold uppercase tracking-widest rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[1.1rem] font-bold uppercase tracking-widest text-black/40 mb-4">Listings</p>
                  {result.jobs?.map((job, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-sb-cream rounded-[8px] hover:bg-sb-ceramic/50 transition-all">
                      <div>
                        <p className="text-[1.4rem] font-bold text-sb-green uppercase tracking-tight">{job.role}</p>
                        <p className="text-[1.2rem] text-black/50 font-medium">{job.company_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
