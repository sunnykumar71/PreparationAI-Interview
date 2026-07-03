import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Award, Sparkles, LayoutDashboard, RefreshCw, ChevronLeft, 
  CheckCircle2, AlertTriangle, BookOpen, AlertCircle, Loader2,
  ThumbsUp, MessageSquare, ShieldCheck, HelpCircle
} from "lucide-react";

export const InterviewReport: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token } = useApp();
  const navigate = useNavigate();

  const [session, setSession] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interview/report/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error("Failed to load interview report metrics.");
        }
        const data = await res.json();
        setSession(data.session);
        setQuestions(data.questions);
      } catch (err: any) {
        setError(err.message || "Failed to fetch report elements.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId, token, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(screen-16)] bg-[#09090b] text-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <span className="text-white/40 font-mono text-sm">Aggregating AI evaluations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-red-950/20 border border-red-500/20 rounded-2xl text-center text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-display font-bold text-red-400 mb-2">Report Load Error</h3>
        <p className="text-sm text-white/70 mb-6">{error}</p>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-blue-500/20"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const score = session?.score || 0;
  
  // Calculate granular communication / confidence ratings dynamically based on score
  const techKnowledgeScore = Math.min(Math.max(Math.floor(score * 1.02), 0), 10);
  const commScore = Math.min(Math.max(Math.floor(score * 0.98), 0), 10);
  const confidenceScore = Math.min(Math.max(Math.floor(score * 1.05), 0), 10);

  // Compile recommended learning path based on topic
  const getRecommendedLearningPath = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes("java")) {
      return [
        "Master Java Memory Model (JMM), Heap vs Stack allocation, and GC optimization parameters.",
        "Deepen familiarity with Java Concurrent Package classes (ConcurrentHashMap, CopyOnWriteArrayList, ExecutorService).",
        "Practice lambda operations, functional interfaces, and stream lazy pipelines."
      ];
    } else if (t.includes("react")) {
      return [
        "Study React Reconciler engine (Fiber, scheduling priority, batched updates).",
        "Optimize render lifecycles with useMemo, useCallback, and React.memo boundaries.",
        "Explore advanced state management architectures and React Server Components (RSC)."
      ];
    } else {
      return [
        "Study core database indexing structures, b-trees, and query profiling models.",
        "Practice structural STAR methodology to articulate system bottlenecks and scaling actions.",
        "Explore microservice fault-tolerance patterns (Circuit breakers, bulkheads, rate limiters)."
      ];
    }
  };

  const learningPath = getRecommendedLearningPath(session?.topic || "Technical");

  return (
    <div className="bg-[#09090b] min-h-screen text-white transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation line */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-1 text-sm font-semibold text-white/50 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex space-x-3">
            <Link
              to="/interview/start"
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </Link>
          </div>
        </div>

        {/* Master Report Summary Card */}
        <div className="bg-[#161618] p-8 rounded-2xl border border-white/5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 mb-6">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">{session?.mode} Summary</span>
              <h1 className="text-2xl font-display font-bold mt-1 text-white">Performance Feedback: {session?.topic}</h1>
              <p className="text-xs text-white/40 mt-1">Completed on {session?.completedAt ? new Date(session.completedAt).toLocaleString() : "Date N/A"}</p>
            </div>

            <div className="flex items-center space-x-4 bg-[#09090b] px-6 py-4 rounded-2xl border border-white/10">
              <div className="text-center">
                <span className="text-xs font-mono text-white/40 block font-bold">OVERALL SCORE</span>
                <span className="text-3xl font-extrabold font-mono text-blue-400 mt-1 block">
                  {score} / 10
                </span>
              </div>
            </div>
          </div>

          {/* AI Feedback rating charts / blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-[#09090b] rounded-xl text-center border border-white/5">
              <ShieldCheck className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <span className="text-xs text-white/40 block font-mono">TECHNICAL KNOWLEDGE</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">{techKnowledgeScore}/10</span>
            </div>
            <div className="p-4 bg-[#09090b] rounded-xl text-center border border-white/5">
              <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <span className="text-xs text-white/40 block font-mono">COMMUNICATION INDEX</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">{commScore}/10</span>
            </div>
            <div className="p-4 bg-[#09090b] rounded-xl text-center border border-white/5">
              <ThumbsUp className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <span className="text-xs text-white/40 block font-mono">CONFIDENCE ESTIMATION</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">{confidenceScore}/10</span>
            </div>
          </div>

          {/* Learning path */}
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-blue-400 text-sm uppercase font-mono tracking-wider">AI Recommended Learning Path</h3>
            </div>
            <ul className="space-y-3">
              {learningPath.map((path, idx) => (
                <li key={idx} className="flex items-start text-sm text-white/70">
                  <span className="text-blue-400 mr-2.5 font-bold">✓</span>
                  <span>{path}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Question Reviews */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-display font-bold text-white">Itemized Question Evaluations</h2>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm space-y-4">
              
              <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white leading-relaxed">
                      {q.question}
                    </h3>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-[#09090b] border border-white/10 rounded-lg flex-shrink-0 text-center font-mono">
                  <span className="text-[10px] text-white/40 block font-bold">GRADE</span>
                  <span className="text-xs font-bold text-blue-400">{q.score !== null ? `${q.score}/10` : "Skipped"}</span>
                </div>
              </div>

              {/* User Answer block */}
              <div>
                <span className="text-xs font-mono font-bold text-white/40 uppercase block mb-1">Your Submission</span>
                <p className="text-xs bg-[#09090b]/60 p-3 rounded-xl border border-white/10 text-white/70 font-sans leading-relaxed whitespace-pre-wrap italic">
                  {q.userAnswer || "[No response details submitted]"}
                </p>
              </div>

              {/* Evaluation Blocks */}
              {q.userAnswer && (
                <div className="space-y-4 pt-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase block mb-1">Expert Correct Explanation</span>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      {q.correctAnswer}
                    </p>
                  </div>

                  {q.optimalSolutionAnalysis && (
                    <div className="bg-[#09090b] text-white/70 p-4 rounded-xl text-xs font-mono border border-white/10 space-y-2">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Optimal Algorithm Complexities Analysis</span>
                      <div>Complexity details: {q.timeSpaceComplexity || "O(N) bounds"}</div>
                      <div className="leading-relaxed text-white/60 font-sans mt-1">{q.optimalSolutionAnalysis}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-rose-400 uppercase block mb-1">Missing Points</span>
                      <ul className="space-y-1">
                        {q.missingPoints && q.missingPoints.length > 0 ? (
                          q.missingPoints.map((pt: string, i: number) => (
                            <li key={i} className="text-xs text-white/50 flex items-start">
                              <span className="text-rose-400 mr-2">•</span>
                              <span>{pt}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-emerald-400">Perfect alignment.</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase block mb-1">Suggestions</span>
                      <ul className="space-y-1">
                        {q.suggestions && q.suggestions.length > 0 ? (
                          q.suggestions.map((pt: string, i: number) => (
                            <li key={i} className="text-xs text-white/50 flex items-start">
                              <span className="text-emerald-400 mr-2">→</span>
                              <span>{pt}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-white/40">Response already optimal.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
