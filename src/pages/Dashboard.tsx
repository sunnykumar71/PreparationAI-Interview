import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { 
  Award, Play, FileText, BarChart3, Clock, CheckCircle2, 
  ChevronRight, Sparkles, TrendingUp, HelpCircle, ArrowUpRight, Activity 
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { token, user } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "An error occurred loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(screen-16)] bg-[#09090b] text-white">
        <Activity className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <span className="text-white/40 font-mono text-sm">Aggregating interview performance metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-red-950/20 border border-red-500/20 rounded-2xl text-center">
        <HelpCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-400 mb-2">Failed to Load Dashboard</h3>
        <p className="text-sm text-red-400/70 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] min-h-screen text-white pb-16">
      
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white">
              Welcome Back, {user?.name}!
            </h1>
            <p className="mt-1.5 text-sm text-white/50">
              Prepare, track achievements, and inspect tailored recommendations based on actual session inputs.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              to="/interview/start"
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start New Interview</span>
            </Link>
            <Link
              to="/resume/upload"
              className="flex items-center space-x-1.5 px-4 py-2 bg-white/5 text-white/90 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Resume Interview</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block font-mono tracking-wider">COMPLETED ROUNDS</span>
              <span className="text-2xl font-bold">{stats?.totalInterviews || 0}</span>
            </div>
          </div>

          <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block font-mono tracking-wider">AVERAGE SCORE</span>
              <span className="text-2xl font-bold">{stats?.averageScore ? `${stats.averageScore}/10` : "N/A"}</span>
            </div>
          </div>

          <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block font-mono tracking-wider">QUESTIONS EVALUATED</span>
              <span className="text-2xl font-bold">{stats?.totalQuestionsAttempted || 0}</span>
            </div>
          </div>

          <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block font-mono tracking-wider">ACCURACY ACCENT</span>
              <span className="text-2xl font-bold">{stats?.accuracy || 0}%</span>
            </div>
          </div>

        </div>

        {/* Dashboard Visualizer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold font-display">Topic-Wise Performance Profile</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-white/5 text-white/50 rounded font-mono">AVG GRADE OUT OF 10</span>
            </div>

            <div className="h-64 w-full">
              {stats?.topicWisePerformance && stats.topicWisePerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topicWisePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="topic" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} stroke="rgba(255,255,255,0.1)" />
                    <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} stroke="rgba(255,255,255,0.1)" />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.03)' }}
                      contentStyle={{ 
                        backgroundColor: '#161618', 
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40 text-xs font-mono">
                  No topic performance data available. Complete an interview to render!
                </div>
              )}
            </div>
          </div>

          {/* Strong / Weak Topic Summary */}
          <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold font-display">AI Skill Diagnostic</h2>
              </div>

              {/* Strong Topics */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono mb-3">
                  Strong Areas (Score ≥ 8.0)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats?.strongTopics?.map((topic: string) => (
                    <span 
                      key={topic}
                      className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20"
                    >
                      {topic}
                    </span>
                  )) || <span className="text-white/40 text-xs">Complete interviews to find.</span>}
                </div>
              </div>

              {/* Weak Topics */}
              <div>
                <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono mb-3">
                  Focus Targets (Score &lt; 7.0)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats?.weakTopics?.map((topic: string) => (
                    <span 
                      key={topic}
                      className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold border border-rose-500/20"
                    >
                      {topic}
                    </span>
                  )) || <span className="text-white/40 text-xs">Keep up the good work! No active weak zones.</span>}
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-blue-400 block mb-1">💡 Daily Recommendation</span>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Take a 10-minute technical evaluation on your target topic to expand vocabulary and optimize structural frameworks.
              </p>
            </div>
          </div>

        </div>

        {/* Recent Interview History */}
        <div className="bg-[#161618] rounded-2xl border border-white/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold font-display">Recent Session Logs</h2>
            </div>
            <Link 
              to="/interview/start" 
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-0.5"
            >
              <span>Practice More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats?.recentSessions && stats.recentSessions.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-left font-mono text-xs">
                    <th className="pb-3 font-medium">TOPIC</th>
                    <th className="pb-3 font-medium">MODE</th>
                    <th className="pb-3 font-medium">DIFFICULTY</th>
                    <th className="pb-3 font-medium">AVERAGE GRADE</th>
                    <th className="pb-3 font-medium">STATUS</th>
                    <th className="pb-3 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentSessions.map((session: any) => (
                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-semibold text-white">{session.topic}</td>
                      <td className="py-4 text-white/60 font-sans text-xs">{session.mode}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          session.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400" :
                          session.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400" :
                          "bg-rose-500/10 text-rose-400"
                        }`}>
                          {session.difficulty}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-sm text-blue-400">
                        {session.isCompleted ? `${session.score}/10` : "Active"}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                          session.isCompleted ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${session.isCompleted ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span>{session.isCompleted ? "Completed" : "In Progress"}</span>
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {session.isCompleted ? (
                          <Link 
                            to={`/interview/report/${session.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-white/5 text-white/90 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/10"
                          >
                            <span>Inspect Report</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link 
                            to={session.mode === "Coding Interview" ? `/interview/coding/${session.id}` : `/interview/mock/${session.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                          >
                            <span>Resume</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-white/40 text-sm font-mono">
                No session logs found. Click "Start New Interview" to begin your journey!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
