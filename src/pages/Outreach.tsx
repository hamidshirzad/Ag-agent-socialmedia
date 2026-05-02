import { useState, useRef, type ChangeEvent } from "react";
import { Sidebar } from "../components/Sidebar";
import { Upload, Play, BarChart2, Zap, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Outreach() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setImportedCount(null);
    setImportError(null);

    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

      const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const nameIdx = headers.findIndex(h => h.includes("name"));
      const emailIdx = headers.findIndex(h => h.includes("email"));
      const sourceIdx = headers.findIndex(h => h.includes("source"));

      const leadsCol = collection(db, "leads");
      const writes = lines.slice(1)
        .map(line => line.split(",").map(c => c.trim().replace(/^"|"$/g, "")))
        .filter(cols => cols.some(Boolean))
        .map(cols => {
          const name = cols[nameIdx >= 0 ? nameIdx : 0] ?? "Unknown";
          const email = cols[emailIdx >= 0 ? emailIdx : 1] ?? "";
          const source = cols[sourceIdx >= 0 ? sourceIdx : 2] ?? "csv-import";
          return addDoc(leadsCol, {
            userId: user.uid,
            name,
            email,
            source: source || "csv-import",
            score: 0,
            status: "new",
            createdAt: new Date().toISOString(),
          });
        });

      await Promise.all(writes);
      setImportedCount(writes.length);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "leads");
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="mb-16 pb-8 border-b border-black/10">
          <h1 className="text-sb-green font-semibold text-[3.6rem] leading-tight mb-2 uppercase tracking-sb">Outreach Engine</h1>
          <p className="text-[1.6rem] text-black/50 font-medium">Autonomous Prospecting & Personalized Sequencing</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {/* Upload Area */}
            <div className="bg-white border-2 border-dashed border-sb-green/20 rounded-[12px] p-24 flex flex-col items-center justify-center text-center sb-shadow-card">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-24 h-24 bg-sb-cream rounded-full flex items-center justify-center mb-8">
                {importedCount !== null
                  ? <CheckCircle2 size={40} className="text-sb-accent" />
                  : <Upload size={40} className="text-sb-green/20" />
                }
              </div>
              <h3 className="text-[2.4rem] font-bold text-sb-green mb-4 uppercase tracking-sb">Import Target Data</h3>
              {importedCount !== null && (
                <p className="text-[1.4rem] font-bold text-sb-accent mb-4 uppercase tracking-widest">
                  {importedCount} leads imported successfully
                </p>
              )}
              {importError && (
                <p className="text-[1.3rem] font-bold text-red-500 mb-4">{importError}</p>
              )}
              <p className="text-[1.4rem] text-black/50 mb-12 max-w-[32rem] font-medium leading-relaxed italic uppercase tracking-wider">
                Upload a .CSV of LinkedIn profiles or Emails to trigger the AI personalization layer.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-12 py-5 bg-sb-accent text-white rounded-full font-bold text-[1.4rem] uppercase tracking-widest sb-button-active shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Importing..." : "Choose File (.csv)"}
              </button>
            </div>

            {/* Strategy Logic */}
            <div className="bg-white rounded-[12px] sb-shadow-card">
               <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                 <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-wider flex items-center gap-3">
                   <Play size={18} className="fill-sb-green" /> Campaign Sequence
                 </h3>
                 <span className="text-[1rem] bg-sb-accent text-white px-4 py-1 sb-pill font-black tracking-widest uppercase shadow-lg">Optimized</span>
               </div>
               <div className="p-8 space-y-6">
                  {[
                    { step: 1, action: "Identify Pain Points", detail: "Scans profile for recent posts & interests" },
                    { step: 2, action: "Generate Hook", detail: "Personalized first line using Neural Synthesis" },
                    { step: 3, action: "Deploy Message", detail: "Sent via LinkedIn / Email Relay" },
                    { step: 4, action: "Auto-Followup", detail: "Triggered if no response in 72 hours" }
                  ].map((s) => (
                    <div key={s.step} className="flex gap-8 p-8 bg-sb-cream/20 rounded-[12px] border border-sb-green/5 hover:bg-sb-cream/50 transition-all group">
                       <span className="w-12 h-12 rounded-full bg-sb-house text-sb-gold flex items-center justify-center text-[1.4rem] font-black shrink-0 shadow-md">
                         {s.step}
                       </span>
                       <div>
                          <h4 className="text-[1.6rem] font-bold uppercase tracking-tight text-sb-green mb-1">{s.action}</h4>
                          <p className="text-[1.3rem] text-black/40 font-bold uppercase tracking-widest">{s.detail}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Outreach Stats */}
          <div className="space-y-12">
            <div className="bg-sb-house text-white p-12 rounded-[12px] sb-shadow-frap relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-sb-accent" />
               <div className="flex items-center gap-4 mb-12 opacity-50">
                  <BarChart2 size={20} />
                  <span className="text-[1.2rem] font-bold uppercase tracking-widest drop-shadow-sm">Engine Stats</span>
               </div>
               <div className="space-y-12">
                  <OutreachStat label="Messages Sent" value="1,204" />
                  <OutreachStat label="Reply Rate" value="12.4%" />
                  <OutreachStat label="Meetings Booked" value="42" />
               </div>
            </div>

            <div className="p-10 bg-white border border-sb-green/10 italic text-[1.4rem] leading-relaxed text-black/60 rounded-[12px] tracking-sb sb-shadow-card">
               "System intelligence has detected a higher response rate using 'Thought-Leadership' hooks for CTO targets in the SaaS niche. Strategy auto-adjusted."
            </div>
          </div>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-60">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}

function OutreachStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="group">
      <p className="text-[1.2rem] opacity-40 uppercase tracking-widest mb-2 font-bold group-hover:opacity-60 transition-all">{label}</p>
      <h3 className="text-[4rem] font-bold tracking-sb leading-tight drop-shadow-md text-sb-gold">{value}</h3>
    </div>
  );
}
