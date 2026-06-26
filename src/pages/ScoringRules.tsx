import { useState, useEffect, FormEvent } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  Settings2,
  TrendingUp,
  Activity,
  Database,
  CheckCircle2,
  X
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { ScoringRule } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function ScoringRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newRule, setNewRule] = useState<Partial<ScoringRule>>({
    attribute: "",
    operator: "contains",
    value: "",
    points: 10,
    isActive: true,
    category: "attribute"
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "scoringRules"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rulesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScoringRule[];
      setRules(rulesData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/scoringRules`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddRule = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const path = `users/${user.uid}/scoringRules`;
      await addDoc(collection(db, path), {
        ...newRule,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewRule({
        attribute: "",
        operator: "contains",
        value: "",
        points: 10,
        isActive: true,
        category: "attribute"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/scoringRules`);
    }
  };

  const toggleRuleActive = async (ruleId: string, currentState: boolean) => {
    if (!user) return;
    try {
      const ruleRef = doc(db, "users", user.uid, "scoringRules", ruleId);
      await updateDoc(ruleRef, { isActive: !currentState });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/scoringRules/${ruleId}`);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!user) return;
    try {
      const ruleRef = doc(db, "users", user.uid, "scoringRules", ruleId);
      await deleteDoc(ruleRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/scoringRules/${ruleId}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-sb-cream text-black font-sans tracking-sb">
      <Sidebar />
      
      <main className="flex-1 p-12 lg:p-24 overflow-y-auto">
        <header className="flex justify-between items-end mb-16 pb-10 border-b border-black/5">
          <div>
            <h1 className="text-[4.8rem] font-bold text-sb-green tracking-sb mb-2 uppercase">Scoring Engine</h1>
            <p className="text-black/40 text-[1.6rem] font-medium italic">Define neural weights for granular lead qualification (0-1000 scale)</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-sb-accent text-white px-10 py-5 rounded-full text-[1.4rem] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-sb-house hover:shadow-xl transition-all sb-button-active"
          >
            <Plus size={18} /> Add New Rule
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex items-center gap-6">
            <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center text-sb-green">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Max Score</p>
              <h3 className="text-[2.4rem] font-bold text-sb-green leading-none">1000</h3>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex items-center gap-6">
            <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center text-sb-accent">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Active Rules</p>
              <h3 className="text-[2.4rem] font-bold text-sb-green leading-none">{rules.filter(r => r.isActive).length}</h3>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[12px] sb-shadow-card flex items-center gap-6">
            <div className="w-16 h-16 bg-sb-cream rounded-full flex items-center justify-center text-sb-gold">
              <Database size={24} />
            </div>
            <div>
              <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Data Sources</p>
              <h3 className="text-[2.4rem] font-bold text-sb-green leading-none">3</h3>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          <AnimatePresence>
            {rules.map((rule) => (
              <motion.div 
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white p-10 rounded-[12px] sb-shadow-card flex flex-col md:flex-row justify-between items-center gap-8 group transition-all",
                  !rule.isActive && "opacity-60 grayscale"
                )}
              >
                <div className="flex items-center gap-8 flex-1">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg",
                    rule.category === 'attribute' ? "bg-sb-accent" :
                    rule.category === 'engagement' ? "bg-sb-gold" : "bg-sb-house"
                  )}>
                    {rule.category === 'attribute' ? <Settings2 size={20} /> :
                     rule.category === 'engagement' ? <Activity size={20} /> : <Database size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[1.1rem] font-black uppercase tracking-widest text-sb-green/40">{rule.category}</span>
                      <span className={cn(
                        "text-[1rem] px-2 py-0.5 rounded-full uppercase font-black tracking-wider",
                        rule.isActive ? "bg-sb-light text-sb-green" : "bg-black/10 text-black/50"
                      )}>
                        {rule.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <h4 className="text-[1.8rem] font-bold text-sb-green uppercase tracking-tight">
                      If {rule.attribute} <span className="text-sb-accent italic">{rule.operator}</span> "{rule.value}"
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-[1.1rem] uppercase font-black tracking-widest text-black/40 mb-1">Neural Weight</p>
                    <span className={cn(
                      "text-[2rem] font-black",
                      rule.points >= 0 ? "text-sb-accent" : "text-red-500"
                    )}>
                      {rule.points >= 0 ? '+' : ''}{rule.points}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleRuleActive(rule.id, rule.isActive)}
                      className="w-12 h-12 bg-sb-cream rounded-full flex items-center justify-center text-sb-house hover:bg-sb-accent hover:text-white transition-all shadow-sm"
                    >
                      <Zap size={18} className={cn(rule.isActive && "fill-current")} />
                    </button>
                    <button 
                      onClick={() => deleteRule(rule.id)}
                      className="w-12 h-12 bg-sb-cream rounded-full flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {rules.length === 0 && !isLoading && !isAdding && (
            <div className="p-24 bg-white border-2 border-dashed border-sb-house/10 rounded-[12px] flex flex-col items-center justify-center text-center shadow-inner">
              <div className="w-24 h-24 bg-sb-cream rounded-full flex items-center justify-center mb-8">
                <Settings2 size={40} className="text-sb-green opacity-20" />
              </div>
              <h3 className="text-[2.4rem] font-bold text-sb-green opacity-30 uppercase tracking-widest">No Rules Defined</h3>
              <p className="max-w-[32rem] text-[1.6rem] text-black/20 mt-4 leading-relaxed font-medium italic uppercase tracking-widest">Add your first neural weight to begin granular scoring.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Rule Modal Overlay */}
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
              className="bg-white rounded-[12px] sb-shadow-frap w-full max-w-[60rem] overflow-hidden"
            >
              <div className="p-10 border-b border-black/5 bg-sb-ceramic flex justify-between items-center">
                <h3 className="text-[2rem] font-bold text-sb-green uppercase tracking-sb">Configure Neural Weight</h3>
                <button onClick={() => setIsAdding(false)} className="text-black/40 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddRule} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Category</label>
                    <select 
                      value={newRule.category}
                      onChange={e => setNewRule({...newRule, category: e.target.value as any})}
                      className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none appearance-none cursor-pointer"
                    >
                      <option value="attribute">Lead Attribute</option>
                      <option value="engagement">Engagement History</option>
                      <option value="crm">CRM Data</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Points (Weight)</label>
                    <input 
                      type="number"
                      value={newRule.points}
                      onChange={e => setNewRule({...newRule, points: parseInt(e.target.value)})}
                      className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Attribute / Key</label>
                  <input 
                    placeholder="e.g. company_size, message_count, industry"
                    value={newRule.attribute}
                    onChange={e => setNewRule({...newRule, attribute: e.target.value})}
                    className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Operator</label>
                    <select 
                      value={newRule.operator}
                      onChange={e => setNewRule({...newRule, operator: e.target.value})}
                      className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none appearance-none cursor-pointer"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="text-[1.1rem] font-black uppercase tracking-[0.15em] text-sb-green/60 block mb-2 px-2">Threshold Value</label>
                    <input 
                      placeholder="e.g. 'Enterprise', '5', 'Tech'"
                      value={newRule.value}
                      onChange={e => setNewRule({...newRule, value: e.target.value})}
                      className="w-full bg-sb-cream border-2 border-transparent rounded-[12px] p-5 text-[1.4rem] font-bold focus:bg-white focus:border-sb-accent outline-none"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-sb-house text-white rounded-full font-black uppercase tracking-[0.15em] text-[1.6rem] flex items-center justify-center gap-4 hover:bg-sb-green hover:shadow-xl transition-all sb-button-active"
                >
                  <Save size={20} /> Save Rule
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Floating Frap Button */}
      <button className="fixed bottom-12 right-12 w-[5.6rem] h-[5.6rem] bg-sb-accent rounded-full flex items-center justify-center text-white sb-shadow-frap sb-button-active z-[60]">
        <Zap className="fill-white w-6 h-6" />
      </button>
    </div>
  );
}
