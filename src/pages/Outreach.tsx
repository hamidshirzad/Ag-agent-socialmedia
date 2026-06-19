import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Sidebar } from "../components/Sidebar";
import PageMeta from "../components/PageMeta";
import { Upload, Send, Play, BarChart2, Trash2, Sparkles, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { generateOutreachMessage } from "../services/geminiService";
import type { OutreachContact } from "../types";

function parseCsv(text: string): { name: string; email?: string; linkedinUrl?: string }[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase().split(",").map(h => h.trim());
  const nameIdx = header.indexOf("name");
  const emailIdx = header.indexOf("email");
  const linkedinIdx = header.findIndex(h => h.includes("linkedin"));
  const hasHeader = nameIdx !== -1 || emailIdx !== -1 || linkedinIdx !== -1;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map(line => {
    const cols = line.split(",").map(c => c.trim());
    if (!hasHeader) {
      return { name: cols[0] || "Unknown", email: cols[1] || undefined, linkedinUrl: cols[2] || undefined };
    }
    return {
      name: (nameIdx !== -1 ? cols[nameIdx] : cols[0]) || "Unknown",
      email: emailIdx !== -1 ? cols[emailIdx] || undefined : undefined,
      linkedinUrl: linkedinIdx !== -1 ? cols[linkedinIdx] || undefined : undefined,
    };
  }).filter(row => row.name);
}

export default function Outreach() {
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/outreachContacts`;
    const unsubscribe = onSnapshot(
      query(collection(db, path)),
      snapshot => {
        setContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OutreachContact)));
      },
      error => handleFirestoreError(error, OperationType.LIST, path),
    );
    return unsubscribe;
  }, [user]);

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const path = `users/${user.uid}/outreachContacts`;

      await Promise.all(rows.map(row => addDoc(collection(db, path), {
        userId: user.uid,
        name: row.name,
        ...(row.email ? { email: row.email } : {}),
        ...(row.linkedinUrl ? { linkedinUrl: row.linkedinUrl } : {}),
        status: "pending",
        createdAt: serverTimestamp(),
      })));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/outreachContacts`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateOutreach = async (contact: OutreachContact) => {
    if (!user) return;
    const path = `users/${user.uid}/outreachContacts/${contact.id}`;
    setGeneratingId(contact.id);
    try {
      await updateDoc(doc(db, path), { status: "personalizing" });
      const result = await generateOutreachMessage(
        contact.name,
        profile?.niche || "",
        profile?.company || "",
        profile?.apiKeys,
      );
      await updateDoc(doc(db, path), {
        status: "sent",
        personalizedMessage: result.message || "",
      });
    } catch (error) {
      await updateDoc(doc(db, path), { status: "failed" }).catch(() => {});
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/outreachContacts/${contactId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const sentCount = contacts.filter(c => c.status === "sent").length;
  const replyRate = contacts.length > 0 ? Math.round((sentCount / contacts.length) * 1000) / 10 : 0;

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <PageMeta title="Outreach" description="Automate personalised outreach and follow-up sequences." path="/outreach" />
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
              <div className="w-24 h-24 bg-sb-cream rounded-full flex items-center justify-center mb-8">
                <Upload size={40} className="text-sb-green/20" />
              </div>
              <h3 className="text-[2.4rem] font-bold text-sb-green mb-4 uppercase tracking-sb">Import Target Data</h3>
              <p className="text-[1.4rem] text-black/50 mb-12 max-w-[32rem] font-medium leading-relaxed italic uppercase tracking-wider">
                Upload a .CSV of LinkedIn profiles or Emails to trigger the AI personalization layer.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelected}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-12 py-5 bg-sb-accent text-white rounded-full font-bold text-[1.4rem] uppercase tracking-widest sb-button-active shadow-xl disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Choose File (.csv)"}
              </button>
            </div>

            {/* Contacts List */}
            <div className="bg-white rounded-[12px] sb-shadow-card">
               <div className="p-8 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                 <h3 className="text-sb-green font-bold text-[1.6rem] uppercase tracking-wider flex items-center gap-3">
                   <Play size={18} className="fill-sb-green" /> Imported Contacts
                 </h3>
                 <span className="text-[1rem] bg-sb-accent text-white px-4 py-1 sb-pill font-black tracking-widest uppercase shadow-lg">{contacts.length} Loaded</span>
               </div>
               <div className="divide-y divide-black/5">
                  {contacts.length === 0 ? (
                    <div className="p-12 text-center text-[1.4rem] text-black/30 font-medium italic">No contacts imported yet.</div>
                  ) : contacts.map(contact => (
                    <div key={contact.id} className="flex flex-col gap-4 p-8 bg-sb-cream/10 hover:bg-sb-cream/30 transition-all">
                       <div className="flex items-center justify-between gap-8">
                          <div>
                             <h4 className="text-[1.5rem] font-bold uppercase tracking-tight text-sb-green">{contact.name}</h4>
                             <p className="text-[1.2rem] text-black/40 font-medium">{contact.email || contact.linkedinUrl || "No contact info"}</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className={cn(
                               "text-[1rem] px-3 py-1 sb-pill font-black tracking-widest uppercase",
                               contact.status === "sent" && "bg-sb-green text-white",
                               contact.status === "failed" && "bg-red-100 text-red-600",
                               contact.status === "personalizing" && "bg-sb-gold/20 text-sb-house",
                               contact.status === "pending" && "bg-sb-ceramic text-black/40",
                             )}>
                               {contact.status}
                             </span>
                             <button
                               onClick={() => handleGenerateOutreach(contact)}
                               disabled={generatingId === contact.id}
                               title="Generate Personalized Outreach"
                               className="w-12 h-12 flex items-center justify-center bg-sb-house text-sb-gold rounded-full hover:bg-sb-accent hover:text-white transition-all sb-button-active disabled:opacity-50"
                             >
                               {generatingId === contact.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                             </button>
                             <button
                               onClick={() => handleRemoveContact(contact.id)}
                               title="Remove contact"
                               className="w-12 h-12 flex items-center justify-center bg-sb-cream rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all sb-button-active"
                             >
                               <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                       {contact.personalizedMessage && (
                         <p className="text-[1.3rem] text-black/60 italic bg-white p-4 rounded-[8px] border border-sb-green/10">{contact.personalizedMessage}</p>
                       )}
                    </div>
                  ))}
               </div>
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
                  <OutreachStat label="Contacts Imported" value={String(contacts.length)} />
                  <OutreachStat label="Messages Generated" value={String(sentCount)} />
                  <OutreachStat label="Personalization Rate" value={`${replyRate}%`} />
               </div>
            </div>

            <div className="p-10 bg-white border border-sb-green/10 italic text-[1.4rem] leading-relaxed text-black/60 rounded-[12px] tracking-sb sb-shadow-card">
               "System intelligence has detected a higher response rate using 'Thought-Leadership' hooks for CTO targets in the SaaS niche. Strategy auto-adjusted."
            </div>
          </div>
        </div>
      </main>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Send className="fill-white w-6 h-6" />
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
