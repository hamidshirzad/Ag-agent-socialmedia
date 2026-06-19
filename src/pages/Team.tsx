import { useState, useEffect, FormEvent } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  ChevronRight,
  UserCheck,
  X,
  Plus
} from "lucide-react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { TeamMember } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Team() {
  const { user, profile, refreshProfile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: "",
    email: "",
    role: "Manager",
    status: "Pending"
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if workspace is on the agency tier
  const isAgency = profile?.plan === "agency";

  // Firestore Sync - load team members only if authentication and agency tier is active (or even to show list if they upgrade/sim-mode)
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/teamMembers`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      setMembers(membersData);
      setIsLoading(false);
    }, (error) => {
      // If permission is denied because rules lock read, handle it elegantly
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle invitation submission
  const handleInviteMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);

    // Simple fields validation
    if (!newMember.name?.trim() || !newMember.email?.trim()) {
      setErrorMessage("Please fill out all transmission parameters.");
      return;
    }

    if (members.some(m => m.email.toLowerCase() === newMember.email?.toLowerCase())) {
      setErrorMessage("This email has already been enlisted in your neural workspace.");
      return;
    }

    try {
      const path = `users/${user.uid}/teamMembers`;
      await addDoc(collection(db, path), {
        userId: user.uid,
        name: newMember.name,
        email: newMember.email.toLowerCase(),
        role: newMember.role,
        status: "Pending"
      });

      setIsAdding(false);
      setNewMember({
        name: "",
        email: "",
        role: "Manager",
        status: "Pending"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/teamMembers`);
    }
  };

  // Modify individual team member access roles
  const handleUpdateRole = async (memberId: string, newRole: 'Manager' | 'Analyst' | 'Content Editor') => {
    if (!user) return;
    try {
      const memberRef = doc(db, "users", user.uid, "teamMembers", memberId);
      await updateDoc(memberRef, { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/teamMembers/${memberId}`);
    }
  };

  // Toggle active / pending status
  const handleToggleStatus = async (memberId: string, currentStatus: 'Active' | 'Pending') => {
    if (!user) return;
    try {
      const memberRef = doc(db, "users", user.uid, "teamMembers", memberId);
      await updateDoc(memberRef, { status: currentStatus === "Active" ? "Pending" : "Active" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/teamMembers/${memberId}`);
    }
  };

  // Sever/remove member from directory
  const handleRemoveMember = async (memberId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to sever this operator's system link?")) return;
    
    try {
      const memberRef = doc(db, "users", user.uid, "teamMembers", memberId);
      await deleteDoc(memberRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/teamMembers/${memberId}`);
    }
  };

  // Dev mode utility tool - instantly upgrades user schema to Agency to unlock full premium workspace UI simulation.
  // Routed through a server endpoint (Admin SDK) since clients can no longer write `plan` directly — see firestore.rules.
  const handleInstantUpgrade = async () => {
    if (!user || !profile?.id) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/billing/dev-upgrade", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error(`Upgrade failed: ${response.status}`);
      await refreshProfile();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.id}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        {!isAgency ? (
          /* LOCKED AGENCY SCREEN */
          <div className="max-w-4xl mx-auto py-12">
            <header className="mb-16 pb-10 border-b border-black/5">
              <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase flex items-center gap-6">
                <Users size={44} /> Team Workspace
              </h1>
              <p className="text-black/40 text-[1.6rem] font-medium italic">Collaborate and manage your enterprise operators</p>
            </header>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-sb-house text-white rounded-[12px] p-16 sb-shadow-frap border-b-8 border-sb-gold text-center relative overflow-hidden"
            >
              {/* Decorative light pattern */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="w-24 h-24 bg-sb-gold/10 text-sb-gold rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg">
                <Sparkles size={40} />
              </div>

              <h2 className="font-serif text-[3.6rem] leading-tight text-sb-gold tracking-tight mb-6">
                Enlist Your Specialized Operators
              </h2>
              
              <p className="max-w-xl mx-auto text-white/70 text-[1.6rem] leading-relaxed mb-12">
                The <span className="text-sb-gold font-bold">Fourdoor AI Team Console</span> is exclusive to Agency configurations. Unlock secure delegation, access controls, and custom workspace permissions.
              </p>

              <div className="p-8 bg-white/5 border border-white/10 rounded-[12px] max-w-lg mx-auto mb-16 space-y-4 text-left">
                <h4 className="text-[1.3rem] font-black uppercase tracking-[0.15em] text-sb-gold">Agency Superpowers Included:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-[1.4rem] text-white/80">
                    <CheckCircle2 size={16} className="text-sb-gold shrink-0 mt-1" />
                    <span>Invite workspace managers to formulate content rules on your behalf.</span>
                  </div>
                  <div className="flex items-start gap-3 text-[1.4rem] text-white/80">
                    <CheckCircle2 size={16} className="text-sb-gold shrink-0 mt-1" />
                    <span>Assign analysts to optimize lead scoring tables and campaigns.</span>
                  </div>
                  <div className="flex items-start gap-3 text-[1.4rem] text-white/80">
                    <CheckCircle2 size={16} className="text-sb-gold shrink-0 mt-1" />
                    <span>Seat content editors strictly within Content Engine generators.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={handleInstantUpgrade}
                  className="bg-sb-gold hover:bg-white text-sb-house font-black uppercase tracking-widest text-[1.3rem] px-10 py-5 rounded-full shadow-lg hover:shadow-2xl transition-all cursor-pointer sb-button-active flex items-center gap-3"
                >
                  Upgrade to Agency Workspace <ChevronRight size={16} />
                </button>
                <span className="text-white/40 text-[1.2rem] font-bold uppercase tracking-widest">
                  or upgrade in settings
                </span>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ACTIVE TEAM MANAGEMENT SCREEN */
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-10 border-b border-black/5 gap-8">
              <div>
                <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase flex items-center gap-6">
                  <Users size={44} className="text-sb-green fill-sb-light" /> Workspace Directory
                </h1>
                <p className="text-black/40 text-[1.6rem] font-medium italic">Configure delegation hierarchies & system access roles for workspace operators</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-sb-accent text-white px-10 py-5 rounded-full text-[1.4rem] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-sb-house hover:shadow-xl transition-all sb-button-active self-stretch md:self-auto shrink-0"
              >
                <UserPlus size={18} /> Invite Operator
              </button>
            </header>

            {/* Quick Stats overview */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex items-center gap-6">
                <div className="w-16 h-16 bg-sb-light rounded-full flex items-center justify-center text-sb-green">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Total Operators</p>
                  <h3 className="text-[2.4rem] font-bold text-sb-green leading-none">{members.length + 1}</h3>
                </div>
              </div>
              
              <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex items-center gap-6">
                <div className="w-16 h-16 bg-[#fff3cd] rounded-full flex items-center justify-center text-sb-gold">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Pending invites</p>
                  <h3 className="text-[2.4rem] font-bold text-sb-green leading-none">
                    {members.filter(m => m.status === "Pending").length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Active Seats</p>
                  <h3 className="text-[2.4rem] font-bold text-sb-green leading-none">
                    {members.filter(m => m.status === "Active").length + 1}
                  </h3>
                </div>
              </div>

              <div className="bg-sb-house p-10 rounded-[12px] sb-shadow-frap border-b-4 border-sb-gold flex items-center justify-between">
                <div>
                  <p className="text-[1.1rem] uppercase font-black tracking-widest text-white/40 mb-1">Current Tier</p>
                  <h3 className="text-[2rem] font-bold text-sb-gold uppercase leading-tight">Agency</h3>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded text-[1rem] font-black uppercase text-sb-gold border border-sb-gold/10">Active</div>
              </div>
            </section>

            {/* Members directory */}
            <div className="bg-white rounded-[12px] sb-shadow-card overflow-hidden">
              <div className="p-8 border-b border-black/5 bg-sb-ceramic/45 px-10">
                <h3 className="text-[1.6rem] font-black uppercase tracking-widest text-sb-house">Active Fleet Configuration</h3>
              </div>
              
              <div className="divide-y divide-black/5 font-sans text-[1.4rem]">
                
                {/* Always include the principal owner first */}
                <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-sb-cream/15 group">
                  <div className="flex items-center gap-8 flex-1 w-full">
                    <div className="w-14 h-14 rounded-full bg-sb-house flex items-center justify-center text-white text-[1.4rem] font-bold shadow-md">
                       {profile?.name ? profile.name.charAt(0).toUpperCase() : "O"}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-sb-green uppercase">{profile?.name || "Workspace Creator"}</h4>
                        <span className="text-[1rem] bg-sb-green text-white px-3 py-0.5 rounded-full uppercase font-black tracking-widest">OWNER</span>
                      </div>
                      <p className="text-black/40 mt-1 font-semibold">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1 font-sans">Permission Node</p>
                      <span className="text-[1.3rem] font-black uppercase text-sb-accent tracking-wider">Super Administrator</span>
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <span className="text-[1rem] bg-sb-light text-sb-green px-4 py-2 rounded-full uppercase font-black tracking-widest border border-sb-green/15">Active</span>
                    </div>
                  </div>
                </div>

                {/* Team member loops */}
                {members.map((member) => (
                  <motion.div 
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "p-10 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-sb-cream/10 transition-all",
                      member.status === "Pending" && "bg-[#faf9f6]/30"
                    )}
                  >
                    <div className="flex items-center gap-8 flex-1 w-full">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center text-white text-[1.4rem] font-bold shadow-sm transition-all duration-200",
                        member.status === 'Active' ? "bg-sb-accent" : "bg-black/10 text-black/40 border border-dashed border-black/20"
                      )}>
                        {member.status === 'Active' ? <UserCheck size={18} /> : member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-sb-green uppercase">{member.name}</h4>
                          <span className={cn(
                            "text-[1rem] px-3 py-0.5 rounded-full uppercase font-black tracking-widest",
                            member.status === 'Active' ? "bg-indigo-50 text-indigo-600 border border-indigo-200/20" : "bg-yellow-50 text-sb-gold border border-sb-gold/15"
                          )}>
                            {member.status}
                          </span>
                        </div>
                        <p className="text-black/40 mt-1 font-semibold">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 w-full md:w-auto justify-end">
                      
                      {/* Interactive role delegation selector */}
                      <div className="min-w-[18rem]">
                        <label className="text-[1rem] uppercase font-black tracking-widest text-black/40 mb-1.5 block">Access Role Node</label>
                        <select 
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                          className="w-full bg-sb-cream/80 hover:bg-sb-cream border border-black/5 rounded-[8px] p-3 text-[1.3rem] font-bold text-sb-house focus:bg-white focus:border-sb-accent outline-none cursor-pointer uppercase tracking-widest appearance-none pr-8 relative"
                        >
                          <option value="Manager">Manager</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Content Editor">Content Editor</option>
                        </select>
                      </div>

                      {/* Interactive toggle of active/pending for simulation & state test */}
                      <div>
                        <label className="text-[1rem] uppercase font-black tracking-widest text-black/40 mb-1.5 block">Sync State</label>
                        <button 
                          onClick={() => handleToggleStatus(member.id, member.status)}
                          className={cn(
                            "w-full px-5 py-3 border rounded-[8px] text-[1.2rem] font-bold uppercase tracking-widest text-center transition-all cursor-pointer",
                            member.status === 'Active' 
                              ? "bg-white text-sb-accent border-sb-accent/30 hover:bg-slate-50" 
                              : "bg-sb-gold/10 text-[#a06d12] border-sb-gold/30 hover:bg-sb-gold/20"
                          )}
                        >
                          {member.status === "Active" ? "Set Pending" : "Override Active"}
                        </button>
                      </div>

                      {/* Delete actions */}
                      <div className="flex items-center gap-3 pt-5 sm:pt-0">
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="w-12 h-12 bg-sb-cream rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm self-end"
                          title="Sever link with operator"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                ))}

              </div>
              
              {members.length === 0 && (
                <div className="p-20 text-center text-black/40 italic flex flex-col items-center justify-center py-24 bg-[#fffefe]/40">
                  <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center text-sb-green opacity-40 mb-6">
                    <User size={24} />
                  </div>
                  <p className="text-[1.5rem] font-medium uppercase tracking-widest text-sb-house">No Operators Seated</p>
                  <p className="text-[1.3rem] text-black/25 mt-2 max-w-sm">Bring additional fleet members on board by dispatching secure workplace invitations above.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* INVITE OPERATOR OVERLAY */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sb-house/40 backdrop-blur-sm z-[100] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[12px] sb-shadow-frap w-full max-w-[60rem] overflow-hidden border-t-8 border-sb-accent"
            >
              <div className="p-10 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                <h3 className="text-[2rem] font-bold text-sb-green uppercase tracking-sb flex items-center gap-3">
                  <UserPlus size={22} className="text-sb-accent" /> Enlist Workspace Collaborator
                </h3>
                <button onClick={() => setIsAdding(false)} className="text-black/40 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleInviteMember} className="p-10 space-y-8">
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200/30 rounded text-red-600 text-[1.3rem] font-semibold flex items-center gap-3">
                    <ShieldAlert size={16} /> {errorMessage}
                  </div>
                )}

                <div className="group">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Collaborator Name</label>
                  <input 
                    placeholder="e.g. Sarah Connor"
                    value={newMember.name}
                    onChange={e => setNewMember({...newMember, name: e.target.value})}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none"
                    required
                  />
                </div>

                <div className="group">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Operator Email</label>
                  <input 
                    type="email"
                    placeholder="e.g. sarah@cyberdyne.io"
                    value={newMember.email}
                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none"
                    required
                  />
                </div>

                <div className="group">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Access Role Delegation</label>
                  <select 
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value as any})}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none appearance-none cursor-pointer uppercase tracking-widest pl-5"
                  >
                    <option value="Manager">Manager (Full delegation)</option>
                    <option value="Analyst">Analyst (Analyze metrics & qualifications)</option>
                    <option value="Content Editor">Content Editor (Synthesize & schedule campaigns)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-sb-house text-white rounded-full font-black uppercase tracking-[0.15em] text-[1.6rem] flex items-center justify-center gap-4 hover:bg-sb-green hover:shadow-xl transition-all sb-button-active cursor-pointer"
                >
                  <Sparkles size={18} /> dispatch workspace invitation
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
