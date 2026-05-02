import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import { Shield, Save, Zap, Trash2, Link2, Unlink, ChevronDown, ChevronUp, ExternalLink, Bot, MessageSquare } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { cn } from "../lib/utils";
import { SocialAccount } from "../types";

const PLATFORMS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "🔗",
    color: "text-blue-500",
    description: "Post to LinkedIn Pages & profiles. Requires a LinkedIn Page Access Token.",
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/getting-started",
    fields: [
      { key: "accessToken", label: "Page Access Token", placeholder: "AQV..." },
      { key: "pageId", label: "Organization URN / Page ID", placeholder: "urn:li:organization:..." },
    ],
  },
  {
    id: "x",
    name: "X / Twitter",
    icon: "𝕏",
    color: "text-white",
    description: "Post tweets and threads via the X API v2.",
    docsUrl: "https://developer.twitter.com/en/docs/twitter-api",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Enter X API Key" },
      { key: "apiSecret", label: "API Secret", placeholder: "Enter X API Secret" },
      { key: "accessToken", label: "Access Token", placeholder: "Enter Access Token" },
    ],
  },
  {
    id: "meta",
    name: "Meta (Facebook / Instagram)",
    icon: "📘",
    color: "text-blue-400",
    description: "Post to Facebook Pages and Instagram Business accounts via Meta Graph API.",
    docsUrl: "https://developers.facebook.com/docs/graph-api",
    fields: [
      { key: "accessToken", label: "Page Access Token", placeholder: "EAABs..." },
      { key: "pageId", label: "Page ID", placeholder: "123456789" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "text-pink-400",
    description: "Schedule and post videos via TikTok for Business API. Connects via OAuth — no manual token needed.",
    docsUrl: "https://developers.tiktok.com/doc/overview",
    fields: [],
    oauth: true,
  },
];

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [apiKeys, setApiKeys] = useState({
    openai: profile?.apiKeys?.openai || "",
    anthropic: profile?.apiKeys?.anthropic || "",
    gemini: profile?.apiKeys?.gemini || "",
  });

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    company: profile?.company || "",
  });

  // Social account credential state — keyed by platform id
  const [socialForms, setSocialForms] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const p of PLATFORMS) {
      const existing = profile?.socialAccounts?.[p.id as keyof typeof profile.socialAccounts] || {};
      const form: Record<string, string> = {};
      for (const f of p.fields) {
        form[f.key] = (existing as any)[f.key] || "";
      }
      initial[p.id] = form;
    }
    return initial;
  });

  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── TikTok OAuth: pick up result after redirect back from TikTok ──────────
  useEffect(() => {
    if (!profile?.id) return;
    const params = new URLSearchParams(window.location.search);
    const resultId = params.get("tiktok_result");
    const errorMsg = params.get("tiktok_error");

    if (errorMsg) {
      toast.error(`TikTok: ${decodeURIComponent(errorMsg)}`);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (!resultId) return;

    // Remove the param immediately so a refresh doesn't re-trigger
    window.history.replaceState({}, "", window.location.pathname);

    (async () => {
      try {
        const res = await fetch(`/api/tiktok/oauth/result/${resultId}`);
        if (!res.ok) throw new Error("OAuth result expired or not found");
        const data = await res.json() as {
          userId: string; openId: string; accessToken: string;
          refreshToken: string; expiresIn: number; refreshExpiresIn: number; scope: string; connectedAt: string;
        };

        await updateDoc(doc(db, "users", profile.id), {
          "socialAccounts.tiktok": {
            connected:        true,
            openId:           data.openId,
            accessToken:      data.accessToken,
            refreshToken:     data.refreshToken,
            expiresIn:        data.expiresIn,
            refreshExpiresIn: data.refreshExpiresIn,
            scope:            data.scope,
            connectedAt:      data.connectedAt,
          } satisfies SocialAccount,
        });
        await refreshProfile();
        toast.success("TikTok connected successfully.");
      } catch (err) {
        console.error(err);
        toast.error("Failed to save TikTok connection.");
      }
    })();
  }, [profile?.id]);

  const isConnected = (platformId: string) =>
    !!profile?.socialAccounts?.[platformId as keyof typeof profile.socialAccounts]?.connected;

  const handleConnectPlatform = async (platformId: string) => {
    if (!profile?.id) return;

    // TikTok uses server-side OAuth — redirect to the start endpoint
    if (platformId === "tiktok") {
      window.location.href = `/api/tiktok/oauth/start?userId=${encodeURIComponent(profile.id)}`;
      return;
    }

    setSavingPlatform(platformId);
    try {
      const form = socialForms[platformId];
      const hasCredentials = Object.values(form).some(v => (v as string).trim() !== "");
      if (!hasCredentials) {
        toast.error("Please enter at least one credential before connecting.");
        return;
      }
      const account: SocialAccount = {
        ...form,
        connected: true,
        connectedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, "users", profile.id), {
        [`socialAccounts.${platformId}`]: account,
      });
      await refreshProfile();
      setExpandedPlatform(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save connection. Check Firestore rules.");
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!profile?.id) return;
    setSavingPlatform(platformId);
    try {
      // Revoke TikTok access token on the TikTok side before clearing locally
      if (platformId === "tiktok") {
        const accessToken = profile.socialAccounts?.tiktok?.accessToken;
        if (accessToken) {
          await fetch("/api/tiktok/oauth/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken }),
          }).catch(() => { /* revocation failure is non-fatal */ });
        }
      }

      await updateDoc(doc(db, "users", profile.id), {
        [`socialAccounts.${platformId}`]: { connected: false },
      });
      await refreshProfile();
      setSocialForms(prev => ({
        ...prev,
        [platformId]: Object.fromEntries(
          PLATFORMS.find(p => p.id === platformId)!.fields.map(f => [f.key, ""])
        ),
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect platform.");
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsSavingProfile(true);
    try {
      await updateDoc(doc(db, "users", profile.id), {
        name: formData.name,
        company: formData.company,
        apiKeys,
      });
      await refreshProfile();
      toast.success("Neural Configuration Synchronized.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to synchronize settings.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const maskKey = (key: string) =>
    key.length <= 4 ? key : `•••• •••• ${key.slice(-4)}`;

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      <main className="flex-1 p-12 lg:p-24 max-w-7xl overflow-y-auto">
        <header className="mb-16 pb-10 border-b border-black/5">
          <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase">Configuration</h1>
          <p className="text-black/40 text-[1.6rem] font-medium italic">Adjust Neural Parameters & Integrations</p>
        </header>

        <div className="space-y-20">

          {/* AI Engine Keys */}
          <section className="bg-sb-house text-white rounded-[12px] p-12 lg:p-16 sb-shadow-frap border-b-4 border-sb-gold">
            <h2 className="text-[2.1rem] font-bold mb-10 flex items-center gap-4 uppercase tracking-wider">
              <Zap size={24} className="text-sb-gold fill-sb-gold" /> AI Engine Credentials
            </h2>
            <p className="text-white/60 text-[1.4rem] mb-12 italic font-medium">
              Activate higher resonance by connecting your professional AI instances.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {(["gemini", "anthropic", "openai"] as const).map(provider => (
                <div key={provider} className="group">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.2em] text-white/40 block mb-3 px-2">
                    {provider === "gemini" ? "Gemini API Key" : provider === "anthropic" ? "Claude (Anthropic) Key" : "OpenAI Key"}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder={`Enter ${provider} key`}
                      value={apiKeys[provider] && apiKeys[provider] === profile?.apiKeys?.[provider]
                        ? maskKey(apiKeys[provider])
                        : apiKeys[provider]}
                      onChange={e => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-[12px] p-5 pr-14 text-[1.4rem] font-bold focus:bg-white/10 focus:border-sb-gold transition-all outline-none"
                    />
                    {apiKeys[provider] && (
                      <button
                        onClick={() => setApiKeys({ ...apiKeys, [provider]: "" })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex items-center gap-4 text-sb-gold/60 text-[1.1rem] font-black uppercase tracking-widest">
              <Shield size={16} /> 256-Bit Neural Encryption Active
            </div>
          </section>

          {/* Social Relay Connections */}
          <section>
            <h2 className="text-[1.8rem] font-bold text-sb-green mb-4 flex items-center gap-4 uppercase tracking-wider">
              <Link2 size={20} className="text-sb-accent" /> Social Relay Connections
            </h2>
            <p className="text-[1.4rem] text-black/40 italic mb-10">
              Connect your platforms via API credentials. Tokens are stored securely in your private vault.
            </p>
            <div className="space-y-6">
              {PLATFORMS.map(platform => {
                const connected = isConnected(platform.id);
                const expanded = expandedPlatform === platform.id;
                const saving = savingPlatform === platform.id;

                return (
                  <div
                    key={platform.id}
                    className={cn(
                      "rounded-[12px] sb-shadow-card overflow-hidden transition-all",
                      connected ? "bg-white border-l-4 border-sb-accent" : "bg-white"
                    )}
                  >
                    <div className="p-8 flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-sb-cream rounded-full flex items-center justify-center text-[2.4rem] shadow-inner shrink-0">
                          {platform.icon}
                        </div>
                        <div>
                          <h4 className="text-[1.4rem] font-black uppercase tracking-widest text-sb-house">{platform.name}</h4>
                          <p className={cn(
                            "text-[1.1rem] font-black uppercase tracking-widest mt-1",
                            connected ? "text-sb-accent" : "text-black/20"
                          )}>
                            {connected
                              ? `● CONNECTED${(platform as any).oauth && profile?.socialAccounts?.tiktok?.openId ? ` · ${profile.socialAccounts.tiktok.openId}` : ""}`
                              : "○ DISCONNECTED"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {connected && (
                          <button
                            onClick={() => handleDisconnect(platform.id)}
                            disabled={saving}
                            aria-label={`Disconnect ${platform.name}`}
                            className="flex items-center gap-2 text-[1.1rem] font-black border-2 border-red-200 text-red-400 px-5 py-2 uppercase tracking-widest rounded-full hover:border-red-400 transition-all disabled:opacity-40"
                          >
                            <Unlink size={14} /> Sever
                          </button>
                        )}
                        {/* OAuth platforms get a direct action button; others get the expand toggle */}
                        {(platform as any).oauth ? (
                          !connected && (
                            <button
                              onClick={() => handleConnectPlatform(platform.id)}
                              disabled={saving}
                              aria-label={`Connect ${platform.name} via OAuth`}
                              className="flex items-center gap-2 text-[1.1rem] font-black bg-pink-500 text-white px-6 py-3 uppercase tracking-widest rounded-full hover:bg-pink-600 transition-all disabled:opacity-40"
                            >
                              <Link2 size={14} /> Authorize with TikTok
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => setExpandedPlatform(expanded ? null : platform.id)}
                            aria-label={expanded ? `Collapse ${platform.name} settings` : `Expand ${platform.name} settings`}
                            className="flex items-center gap-2 text-[1.1rem] font-black border-2 border-sb-green/10 px-5 py-2 uppercase tracking-widest rounded-full hover:border-sb-green hover:text-sb-green transition-all"
                          >
                            {connected ? "Reconfigure" : "Connect"}
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* OAuth platform: show description inline when connected (no expandable form) */}
                    {(platform as any).oauth && connected && (
                      <div className="border-t border-black/5 px-8 pb-6 pt-4 bg-sb-cream/30 flex items-center justify-between">
                        <p className="text-[1.2rem] text-black/40 italic">{platform.description}</p>
                        <a
                          href={platform.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[1.1rem] font-black text-sb-accent uppercase tracking-widest hover:underline shrink-0 ml-6"
                        >
                          <ExternalLink size={13} /> Docs
                        </a>
                      </div>
                    )}

                    {/* Manual-credential platforms: expandable form */}
                    {!(platform as any).oauth && expanded && (
                      <div className="border-t border-black/5 p-8 bg-sb-cream/30 space-y-6">
                        <p className="text-[1.3rem] text-black/50 italic">{platform.description}</p>
                        <a
                          href={platform.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[1.2rem] font-black text-sb-accent uppercase tracking-widest hover:underline"
                        >
                          <ExternalLink size={14} /> API Documentation
                        </a>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {platform.fields.map(field => (
                            <div key={field.key}>
                              <label className="text-[1.1rem] font-black uppercase tracking-widest text-sb-green/60 block mb-2 px-1">
                                {field.label}
                              </label>
                              <input
                                type="password"
                                placeholder={field.placeholder}
                                value={socialForms[platform.id]?.[field.key] || ""}
                                onChange={e => setSocialForms(prev => ({
                                  ...prev,
                                  [platform.id]: { ...prev[platform.id], [field.key]: e.target.value }
                                }))}
                                className="w-full bg-white border-2 border-black/10 rounded-[12px] p-4 text-[1.3rem] font-bold focus:border-sb-accent focus:ring-2 focus:ring-sb-accent/20 transition-all outline-none"
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleConnectPlatform(platform.id)}
                          disabled={saving}
                          className="bg-sb-house text-white px-10 py-5 rounded-full text-[1.3rem] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-sb-green transition-all disabled:opacity-40 focus:ring-2 focus:ring-sb-house focus:ring-offset-2 outline-none"
                        >
                          {saving ? <Zap className="animate-spin" size={18} /> : <Link2 size={18} />}
                          {saving ? "Connecting..." : connected ? "Update Connection" : "Activate Relay"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Agent Autonomy Settings */}
          <section className="bg-white rounded-[12px] sb-shadow-card p-12 lg:p-16">
            <h2 className="text-[2.1rem] font-bold text-sb-green mb-4 uppercase tracking-wider flex items-center gap-4">
              <Bot size={22} className="text-sb-accent" /> Agent Autonomy
            </h2>
            <p className="text-[1.4rem] text-black/40 italic mb-10">
              These defaults apply to all new posts. You can override per-post in the Content Lab.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-sb-cream rounded-[12px] flex items-center gap-6">
                <Bot size={24} className="text-sb-accent shrink-0" />
                <div>
                  <p className="text-[1.4rem] font-black uppercase tracking-widest text-sb-house">AI Agent Engagement</p>
                  <p className="text-[1.2rem] text-black/40 mt-1">Auto-like, comment & amplify on deploy</p>
                </div>
              </div>
              <div className="p-8 bg-sb-cream rounded-[12px] flex items-center gap-6">
                <MessageSquare size={24} className="text-sb-gold shrink-0" />
                <div>
                  <p className="text-[1.4rem] font-black uppercase tracking-widest text-sb-house">Neural Auto-Reply</p>
                  <p className="text-[1.2rem] text-black/40 mt-1">AI responds to comments & DMs in real time</p>
                </div>
              </div>
            </div>
          </section>

          {/* Operator Profile */}
          <section className="bg-white rounded-[12px] sb-shadow-card p-12 lg:p-16">
            <h2 className="text-[2.1rem] font-bold text-sb-green mb-12 border-b border-black/5 pb-6 uppercase tracking-wider">Operator Profile</h2>
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Full Name</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-[1.2rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-3 px-2">Organization</label>
                  <input
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent transition-all outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-sb-house text-white px-12 py-6 rounded-full text-[1.4rem] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-sb-green hover:shadow-xl transition-all disabled:opacity-40"
              >
                {isSavingProfile ? <Zap className="animate-spin" size={18} /> : <Save size={18} />}
                {isSavingProfile ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </section>

          {/* Billing */}
          <section className="p-12 border-2 border-dashed border-sb-house/20 rounded-[12px] bg-sb-ceramic/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
              <div>
                <h3 className="text-[2.4rem] font-bold text-sb-green uppercase tracking-sb mb-1">{profile?.plan || 'Starter'} Edition</h3>
                <p className="text-[1.4rem] text-black/40 font-medium italic">Next neural cycle: June 01, 2026</p>
              </div>
              <button className="px-10 py-5 bg-white border-2 border-sb-house/10 text-sb-house rounded-full text-[1.3rem] font-black uppercase tracking-widest hover:border-sb-house transition-all sb-button-active shadow-sm">
                Manage Subscription
              </button>
            </div>
          </section>

        </div>
      </main>

      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
