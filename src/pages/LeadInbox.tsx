import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Search, Mail, Calendar, ArrowRight, Zap, TrendingUp,
  Bot, CheckCircle2, XCircle, Send, Edit2, Settings, Brain,
  ToggleLeft, ToggleRight, Loader2, Star, AlertTriangle,
  CheckCheck, MessageSquare
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  collection, query, where, onSnapshot, orderBy,
  addDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { Lead, Message } from "../types";
import { cn, formatDate } from "../lib/utils";
import { analyzeLeadIntent } from "../services/geminiService";

export default function LeadInbox() {
  const { user, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    draftReplies: false,
    autoSendThreshold: 80,
    reviewRequiredThreshold: 40,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Leads real-time listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
      setLeads(data);
      setIsLoading(false);
      // Keep selectedLead in sync with live data
      setSelectedLead(prev => prev ? data.find(l => l.id === prev.id) ?? prev : null);
    }, (err) => handleFirestoreError(err, OperationType.GET, "leads"));
    return unsub;
  }, [user]);

  // Messages real-time listener for selected lead
  useEffect(() => {
    if (!selectedLead) { setMessages([]); return; }
    const q = query(
      collection(db, "leads", selectedLead.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (err) => handleFirestoreError(err, OperationType.GET, "messages"));
    return unsub;
  }, [selectedLead?.id]);

  // Sync settings form when lead selection changes
  useEffect(() => {
    if (selectedLead) {
      setSettingsForm({
        draftReplies: selectedLead.draftReplies ?? false,
        autoSendThreshold: selectedLead.autoSendThreshold ?? 80,
        reviewRequiredThreshold: selectedLead.reviewRequiredThreshold ?? 40,
      });
    }
  }, [selectedLead?.id]);

  // Scroll thread to bottom on new messages
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const selectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditingId(null);
    setEditContent('');
    setReplyText('');
    setShowSettings(false);
  };

  const hasPendingDraft = messages.some(m => m.sender === 'ai' && m.status === 'draft');

  const generateDraft = async () => {
    if (!selectedLead || isAnalyzing || hasPendingDraft) return;
    setIsAnalyzing(true);
    try {
      const lastSent = [...messages].filter(m => m.status !== 'draft').slice(-1)[0];
      const text = lastSent?.content || selectedLead.initialMessage || '';
      if (!text) return;

      const result = await analyzeLeadIntent(text, profile?.apiKeys);
      const confidence: number = typeof result.leadScore === 'number' ? result.leadScore : 0;

      const shouldAutoSend = settingsForm.draftReplies
        && confidence >= settingsForm.autoSendThreshold;

      await addDoc(collection(db, "leads", selectedLead.id, "messages"), {
        leadId: selectedLead.id,
        sender: 'ai',
        content: result.suggestedResponse || '(No response generated)',
        intent: result.intent ?? 'casual',
        confidence,
        status: shouldAutoSend ? 'sent' : 'draft',
        timestamp: new Date().toISOString(),
      });

      // Update lead score and intent from AI analysis
      await updateDoc(doc(db, "leads", selectedLead.id), {
        score: Math.min(1000, Math.max(0, Math.round(confidence * 10))),
        intent: result.intent ?? 'casual',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "messages");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveDraft = async (msg: Message) => {
    if (!selectedLead) return;
    try {
      await updateDoc(doc(db, "leads", selectedLead.id, "messages", msg.id), {
        status: 'sent',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "messages");
    }
  };

  const discardDraft = async (msgId: string) => {
    if (!selectedLead) return;
    try {
      await deleteDoc(doc(db, "leads", selectedLead.id, "messages", msgId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "messages");
    }
  };

  const submitEdit = async (msg: Message) => {
    if (!selectedLead || !editContent.trim()) return;
    try {
      await updateDoc(doc(db, "leads", selectedLead.id, "messages", msg.id), {
        content: editContent.trim(),
        status: msg.status,
      });
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "messages");
    }
  };

  const sendManualReply = async () => {
    if (!selectedLead || !replyText.trim()) return;
    const text = replyText.trim();
    setReplyText('');
    try {
      await addDoc(collection(db, "leads", selectedLead.id, "messages"), {
        leadId: selectedLead.id,
        sender: 'user',
        content: text,
        status: 'sent',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "messages");
    }
  };

  const saveSettings = async () => {
    if (!selectedLead) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, "leads", selectedLead.id), {
        draftReplies: settingsForm.draftReplies,
        autoSendThreshold: settingsForm.autoSendThreshold,
        reviewRequiredThreshold: settingsForm.reviewRequiredThreshold,
      });
      setShowSettings(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "leads");
    } finally {
      setSavingSettings(false);
    }
  };

  const intentBadge = (intent?: string) => {
    if (intent === 'buyer') return 'bg-sb-accent text-white';
    if (intent === 'interested') return 'bg-sb-gold text-sb-house';
    return 'bg-sb-ceramic text-sb-house';
  };

  return (
    <div className="flex h-screen bg-sb-cream text-black font-sans selection:bg-sb-house selection:text-white">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden">
        {/* Lead List */}
        <div className="w-[38rem] border-r border-black/5 bg-white flex flex-col sb-shadow-nav z-10 shrink-0">
          <div className="p-10 border-b border-black/5 shrink-0 bg-sb-ceramic/30">
            <h1 className="text-[2.4rem] font-bold uppercase tracking-wider text-sb-green mb-6 flex items-center gap-4">
              <Users size={28} className="text-sb-accent" />
              Lead Nexus
            </h1>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-sb-green opacity-30" size={18} />
              <input
                placeholder="Search leads..."
                className="w-full bg-sb-cream border-none py-5 pl-16 pr-6 text-[1.4rem] font-bold rounded-full focus:ring-2 focus:ring-sb-accent outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center opacity-30 text-[1.4rem] font-bold animate-pulse">Syncing Database...</div>
            ) : leads.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-sb-green opacity-20" />
                </div>
                <p className="text-[1.2rem] font-bold uppercase tracking-widest opacity-30 italic">No leads captured yet.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => selectLead(lead)}
                  className={cn(
                    "w-full text-left p-8 border-b border-black/5 transition-all hover:bg-sb-cream/30 group",
                    selectedLead?.id === lead.id
                      ? "bg-sb-cream/50 relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1.5 after:bg-sb-accent"
                      : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[1.5rem] text-sb-green group-hover:text-sb-accent transition-colors truncate">{lead.name}</h3>
                    <span className="text-[1.1rem] font-black bg-sb-house text-sb-gold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm shrink-0 ml-2">
                      {lead.score}
                    </span>
                  </div>
                  <p className="text-[1.2rem] text-black/40 mb-3 font-medium italic lowercase truncate">{lead.email}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className={cn(
                      "px-3 py-1 rounded-full uppercase tracking-widest text-[0.95rem] font-bold shadow-sm",
                      lead.status === 'qualified' ? "bg-sb-accent text-white"
                      : lead.status === 'booked' ? "bg-sb-gold text-sb-house"
                      : "bg-sb-ceramic text-sb-house"
                    )}>
                      {lead.status}
                    </span>
                    {lead.intent && (
                      <span className={cn("px-3 py-1 rounded-full text-[0.9rem] font-black uppercase tracking-widest", intentBadge(lead.intent))}>
                        {lead.intent}
                      </span>
                    )}
                    {lead.draftReplies && (
                      <span className="px-3 py-1 rounded-full text-[0.9rem] font-black uppercase tracking-widest bg-sb-house/10 text-sb-house flex items-center gap-1">
                        <Bot size={10} /> AI On
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Lead Detail */}
        <div className="flex-1 bg-sb-cream flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedLead ? (
              <motion.div
                key={selectedLead.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="p-8 lg:p-12 bg-white border-b border-black/5 flex justify-between items-center sb-shadow-nav shrink-0">
                  <div>
                    <h2 className="text-[2.8rem] font-bold tracking-sb text-sb-green uppercase">{selectedLead.name}</h2>
                    <p className="text-[1.4rem] text-black/40 font-medium italic">{selectedLead.source} Lead · Captured {formatDate(selectedLead.createdAt)}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSettings(s => !s)}
                      title="Automation Settings"
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-full transition-all sb-button-active shadow-sm",
                        showSettings ? "bg-sb-accent text-white" : "bg-sb-cream text-sb-green hover:bg-sb-accent hover:text-white"
                      )}
                    >
                      <Settings size={18} />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center bg-sb-cream rounded-full text-sb-green hover:bg-sb-accent hover:text-white transition-all sb-button-active shadow-sm">
                      <Mail size={18} />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center bg-sb-cream rounded-full text-sb-green hover:bg-sb-accent hover:text-white transition-all sb-button-active shadow-sm">
                      <Calendar size={18} />
                    </button>
                    <button className="h-12 bg-sb-accent text-white rounded-full font-black px-8 flex items-center gap-3 hover:shadow-xl sb-button-active transition-all uppercase tracking-widest text-[1.2rem]">
                      Book Call <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Message Thread */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-6">
                      {/* Initial inbound signal */}
                      {selectedLead.initialMessage && (
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-sb-house flex items-center justify-center shrink-0 shadow-md">
                            <Star className="text-sb-gold w-5 h-5 fill-sb-gold" />
                          </div>
                          <div className="max-w-[72%]">
                            <p className="text-[1rem] font-black uppercase tracking-widest text-black/30 mb-2">
                              Inbound Signal · {formatDate(selectedLead.createdAt)}
                            </p>
                            <div className="p-6 bg-white rounded-[12px] sb-shadow-card">
                              <p className="text-[1.4rem] leading-relaxed italic text-black/70">{selectedLead.initialMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message thread */}
                      {messages.map((msg) => {
                        const isDraft = msg.sender === 'ai' && msg.status === 'draft';
                        const isBelowReview = isDraft
                          && typeof msg.confidence === 'number'
                          && msg.confidence < settingsForm.reviewRequiredThreshold;
                        const isAutoReady = isDraft
                          && settingsForm.draftReplies
                          && typeof msg.confidence === 'number'
                          && msg.confidence >= settingsForm.autoSendThreshold;

                        if (isDraft) {
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border-2 border-sb-gold/50 rounded-[16px] p-6 bg-sb-gold/5"
                            >
                              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <Bot size={15} className="text-sb-gold" />
                                  <span className="text-[1.1rem] font-black uppercase tracking-widest text-sb-gold">AI Draft</span>
                                  {typeof msg.confidence === 'number' && (
                                    <span className="text-[1rem] font-bold text-black/40">
                                      Confidence: {msg.confidence}%
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {isBelowReview && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-400 rounded-full text-[0.95rem] font-bold">
                                      <AlertTriangle size={11} /> Review Required
                                    </span>
                                  )}
                                  {isAutoReady && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-sb-accent/10 text-sb-accent rounded-full text-[0.95rem] font-bold">
                                      <CheckCheck size={11} /> Auto-send Ready
                                    </span>
                                  )}
                                </div>
                              </div>

                              {editingId === msg.id ? (
                                <textarea
                                  value={editContent}
                                  onChange={e => setEditContent(e.target.value)}
                                  className="w-full bg-white border border-sb-gold/30 rounded-[8px] p-4 text-[1.4rem] leading-relaxed outline-none focus:ring-2 focus:ring-sb-gold resize-none min-h-[10rem]"
                                />
                              ) : (
                                <p className="text-[1.4rem] leading-relaxed text-black/80">{msg.content}</p>
                              )}

                              <div className="flex gap-3 justify-end mt-4">
                                {editingId === msg.id ? (
                                  <>
                                    <button
                                      onClick={() => { setEditingId(null); setEditContent(''); }}
                                      className="px-5 py-2 rounded-full text-[1.1rem] font-bold bg-sb-ceramic text-sb-house hover:bg-sb-cream transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => submitEdit(msg)}
                                      className="px-5 py-2 rounded-full text-[1.1rem] font-bold bg-sb-gold text-sb-house hover:shadow-md transition-all"
                                    >
                                      Save Edit
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => discardDraft(msg.id)}
                                      className="px-5 py-2 rounded-full text-[1.1rem] font-bold bg-red-50 text-red-400 hover:bg-red-100 transition-all flex items-center gap-2"
                                    >
                                      <XCircle size={13} /> Discard
                                    </button>
                                    <button
                                      onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }}
                                      className="px-5 py-2 rounded-full text-[1.1rem] font-bold bg-sb-ceramic text-sb-house hover:bg-sb-cream transition-all flex items-center gap-2"
                                    >
                                      <Edit2 size={13} /> Edit
                                    </button>
                                    <button
                                      onClick={() => approveDraft(msg)}
                                      className="px-5 py-2 rounded-full text-[1.1rem] font-bold bg-sb-accent text-white hover:shadow-md transition-all flex items-center gap-2"
                                    >
                                      <CheckCircle2 size={13} /> Approve & Send
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          );
                        }

                        const isAI = msg.sender === 'ai';
                        return (
                          <div key={msg.id} className={cn("flex gap-4", isAI ? "justify-end" : "")}>
                            {!isAI && (
                              <div className="w-10 h-10 rounded-full bg-sb-ceramic flex items-center justify-center shrink-0">
                                <MessageSquare size={15} className="text-sb-house" />
                              </div>
                            )}
                            <div className={cn("max-w-[70%] flex flex-col gap-1", isAI ? "items-end" : "items-start")}>
                              <p className="text-[1rem] font-black uppercase tracking-widest text-black/30">
                                {isAI ? 'AI Agent' : 'You'} · {msg.timestamp ? formatDate(msg.timestamp) : ''}
                              </p>
                              <div className={cn(
                                "p-6 rounded-[12px]",
                                isAI ? "bg-sb-house text-white sb-shadow-frap" : "bg-white text-black sb-shadow-card"
                              )}>
                                <p className="text-[1.4rem] leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                            {isAI && (
                              <div className="w-10 h-10 rounded-full bg-sb-accent flex items-center justify-center shrink-0 shadow-lg">
                                <Zap className="text-white w-5 h-5 fill-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {messages.length === 0 && !selectedLead.initialMessage && (
                        <div className="flex flex-col items-center justify-center py-20 text-black/20">
                          <MessageSquare size={40} className="mb-4" />
                          <p className="text-[1.4rem] font-black uppercase tracking-widest">No messages yet</p>
                          <p className="text-[1.2rem] font-medium mt-2 italic">Use "AI Draft" to generate a first reply</p>
                        </div>
                      )}

                      <div ref={threadEndRef} />
                    </div>

                    {/* Reply area */}
                    <div className="p-6 bg-white border-t border-black/5 shrink-0">
                      <div className="flex gap-3 items-end">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type a manual reply... (Shift+Enter for new line)"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendManualReply(); }
                          }}
                          className="flex-1 bg-sb-cream rounded-[12px] p-4 text-[1.3rem] outline-none focus:ring-2 focus:ring-sb-accent resize-none min-h-[5rem] max-h-[12rem]"
                          rows={2}
                        />
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={generateDraft}
                            disabled={isAnalyzing || hasPendingDraft}
                            className="h-10 px-5 bg-sb-gold text-sb-house rounded-full font-black text-[1.1rem] uppercase tracking-wide flex items-center gap-2 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isAnalyzing
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Bot size={13} />}
                            {isAnalyzing ? 'Drafting...' : hasPendingDraft ? 'Draft pending' : 'AI Draft'}
                          </button>
                          <button
                            onClick={sendManualReply}
                            disabled={!replyText.trim()}
                            className="h-10 px-5 bg-sb-accent text-white rounded-full font-black text-[1.1rem] uppercase tracking-wide flex items-center gap-2 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Send size={13} /> Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar */}
                  <div className="w-[26rem] border-l border-black/5 overflow-y-auto p-8 space-y-6 bg-white/50 shrink-0">
                    {/* Lead Analysis */}
                    <div className="p-8 bg-white rounded-[12px] sb-shadow-card">
                      <h4 className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-6">Neural Analysis</h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[1rem] font-black uppercase tracking-widest mb-2 text-sb-green/60">Lead Score</p>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-sb-cream rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sb-accent shadow-[0_0_8px_#00754A] transition-all duration-500"
                                style={{ width: `${Math.min(100, selectedLead.score / 10)}%` }}
                              />
                            </div>
                            <span className="text-[1.6rem] font-black italic text-sb-green">{selectedLead.score}</span>
                          </div>
                        </div>
                        {selectedLead.intent && (
                          <div>
                            <p className="text-[1rem] font-black uppercase tracking-widest mb-2 text-sb-green/60">Intent Signal</p>
                            <span className={cn("px-4 py-1 rounded-full text-[1.1rem] font-black uppercase tracking-widest", intentBadge(selectedLead.intent))}>
                              {selectedLead.intent}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-[1rem] font-black uppercase tracking-widest mb-2 text-sb-green/60">Pipeline Stage</p>
                          <span className={cn(
                            "px-4 py-1 rounded-full text-[1.1rem] font-black uppercase tracking-widest",
                            selectedLead.status === 'qualified' ? "bg-sb-accent text-white"
                            : selectedLead.status === 'booked' ? "bg-sb-gold text-sb-house"
                            : "bg-sb-ceramic text-sb-house"
                          )}>
                            {selectedLead.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Lift */}
                    <div className="p-8 bg-sb-house text-white rounded-[12px] sb-shadow-frap relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-sb-gold" />
                      <TrendingUp className="text-sb-gold mb-4" size={28} />
                      <h4 className="text-[1.6rem] font-bold mb-2 uppercase tracking-sb">Conversion Lift</h4>
                      <p className="text-[1.3rem] opacity-60 font-medium italic">
                        {selectedLead.score >= 700
                          ? "84% probability of closing if demo scheduled within 48h."
                          : selectedLead.score >= 400
                          ? "Moderate buying signals. Follow-up recommended."
                          : "Early stage. Nurture with value-driven content."}
                      </p>
                    </div>

                    {/* Automation Settings (collapsible) */}
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-8 bg-white rounded-[12px] sb-shadow-card border border-sb-accent/10">
                            <h4 className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-sb-green/40 mb-6 flex items-center gap-2">
                              <Brain size={13} /> AI Automation
                            </h4>
                            <div className="space-y-6">
                              {/* Toggle AI drafts */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[1.3rem] font-bold text-sb-green">AI Draft Replies</p>
                                  <p className="text-[1.1rem] text-black/40">Auto-generate reply drafts</p>
                                </div>
                                <button
                                  onClick={() => setSettingsForm(f => ({ ...f, draftReplies: !f.draftReplies }))}
                                >
                                  {settingsForm.draftReplies
                                    ? <ToggleRight size={32} className="text-sb-accent" />
                                    : <ToggleLeft size={32} className="text-black/20" />}
                                </button>
                              </div>

                              {/* Auto-send threshold (only when drafts enabled) */}
                              {settingsForm.draftReplies && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <p className="text-[1.2rem] font-bold text-sb-green">Auto-send Threshold</p>
                                    <span className="text-[1.2rem] font-black text-sb-accent">{settingsForm.autoSendThreshold}%</span>
                                  </div>
                                  <p className="text-[1rem] text-black/40 mb-3">Sends automatically when confidence ≥ this</p>
                                  <input
                                    type="range" min={50} max={100} step={5}
                                    value={settingsForm.autoSendThreshold}
                                    onChange={e => setSettingsForm(f => ({ ...f, autoSendThreshold: Number(e.target.value) }))}
                                    className="w-full accent-sb-accent"
                                  />
                                </div>
                              )}

                              {/* Review-required threshold */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <p className="text-[1.2rem] font-bold text-sb-green">Review Required Below</p>
                                  <span className="text-[1.2rem] font-black text-red-400">{settingsForm.reviewRequiredThreshold}%</span>
                                </div>
                                <p className="text-[1rem] text-black/40 mb-3">Always flag for manual review below this confidence</p>
                                <input
                                  type="range" min={0} max={70} step={5}
                                  value={settingsForm.reviewRequiredThreshold}
                                  onChange={e => setSettingsForm(f => ({ ...f, reviewRequiredThreshold: Number(e.target.value) }))}
                                  className="w-full accent-red-400"
                                />
                              </div>

                              <button
                                onClick={saveSettings}
                                disabled={savingSettings}
                                className="w-full py-4 bg-sb-accent text-white rounded-full font-black uppercase tracking-widest text-[1.2rem] hover:shadow-lg transition-all disabled:opacity-50"
                              >
                                {savingSettings ? 'Saving...' : 'Save Settings'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-24 text-center">
                <div className="w-32 h-32 bg-sb-ceramic rounded-full flex items-center justify-center mb-12 shadow-inner">
                  <Users size={48} className="text-sb-green opacity-20" />
                </div>
                <h3 className="text-[3.2rem] font-bold uppercase tracking-widest text-sb-green opacity-10">Nexus Standby</h3>
                <p className="max-w-[32rem] text-[1.6rem] text-black/20 mt-6 leading-relaxed font-medium italic uppercase tracking-widest">
                  Select a lead from the registry to view neural analysis and interaction history.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
