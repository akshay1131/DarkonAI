import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Darkon AI SOC Interface Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 font-mono text-xs">
          <div className="glass-card p-8 rounded-2xl border-cyan-500/40 text-center max-w-lg space-y-4">
            <div className="text-cyan-400 font-bold text-base">DARKON AI SOC DASHBOARD RECOVERED</div>
            <p className="text-slate-400">An interface telemetry event occurred. Click below to refresh the SOC command console.</p>
            <div className="p-3 bg-slate-900 rounded-xl text-red-400 font-mono text-[11px] text-left overflow-x-auto">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-neon-cyan"
            >
              RELOAD SOC DASHBOARD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
