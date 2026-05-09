import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sb-cream flex items-center justify-center p-12 text-center">
          <div className="max-w-xl">
            <h1 className="text-[3.2rem] font-bold text-red-600 mb-4 uppercase tracking-sb">System Failure</h1>
            <p className="text-[1.6rem] text-black/60 mb-8 italic">
              The neural link has been severed by an internal exception.
            </p>
            <div className="bg-white p-8 rounded-[12px] border border-red-200 text-left mb-8 overflow-auto max-h-[30rem]">
              <p className="text-red-500 font-mono text-[1.2rem] whitespace-pre-wrap">
                {this.state.error?.toString() || "Unknown Script Error"}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-sb-house text-white rounded-full font-black uppercase tracking-widest hover:bg-sb-green transition-all"
            >
              Reboot Engine
            </button>
          </div>
        </div>
      );
    }

    const { children } = (this as any).props;
    return children;
  }
}
