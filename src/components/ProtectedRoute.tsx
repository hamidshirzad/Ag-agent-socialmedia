import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f4] text-[#0a0a0a] font-mono">
        <div className="w-12 h-12 border-4 border-[#0a0a0a] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] uppercase font-black tracking-widest animate-pulse italic">Neural_Sync_Active</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
