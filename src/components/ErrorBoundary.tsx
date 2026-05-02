import React from "react";
import { AlertTriangle } from "lucide-react";

interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[40rem] p-24 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
            <AlertTriangle size={40} className="text-red-400" aria-hidden="true" />
          </div>
          <h3 className="text-[2.4rem] font-bold text-sb-green uppercase tracking-widest mb-4">
            System Error
          </h3>
          <p className="text-[1.4rem] text-black/40 max-w-[40rem] italic">
            {this.state.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => (this as any).setState({ hasError: false, message: "" })}
            className="mt-10 px-10 py-5 bg-sb-accent text-white rounded-full font-black uppercase tracking-widest text-[1.3rem] hover:bg-sb-house transition-all focus:ring-2 focus:ring-sb-accent focus:ring-offset-2 outline-none"
          >
            Retry
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
