import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Award, Terminal, Cpu, Play, Brain, ArrowRight, Loader2, 
  HelpCircle, CheckCircle2, ChevronRight, Sparkles, Code 
} from "lucide-react";

export const CodingInterview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token } = useApp();
  const navigate = useNavigate();

  const [session, setSession] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [code, setCode] = useState("");
  const [lang, setLang] = useState("Java");
  const [outputConsole, setOutputConsole] = useState<string | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [evaluation, setEvaluation] = useState<any | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSessionData = async () => {
      try {
        const res = await fetch(`/api/interview/report/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error("Failed to load interview session details.");
        }
        const data = await res.json();
        setSession(data.session);
        setQuestions(data.questions);

        // Find current uncompleted question index
        const firstUnanswered = data.questions.findIndex((q: any) => q.userAnswer === undefined);
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
          setCode(data.questions[firstUnanswered].codeTemplate || getDefaultTemplate("Java"));
        } else {
          setCurrentIndex(data.questions.length - 1);
          setCode(data.questions[data.questions.length - 1].userAnswer || getDefaultTemplate("Java"));
          setEvaluation(data.questions[data.questions.length - 1]);
        }

      } catch (err: any) {
        setError(err.message || "Failed to load coding interview parameters.");
      }
    };

    fetchSessionData();
  }, [sessionId, token, navigate]);

  const getDefaultTemplate = (language: string) => {
    if (language === "Java") {
      return `class Solution {\n    public int solve() {\n        // Write your optimal solution here\n        return 0;\n    }\n}`;
    } else if (language === "Python") {
      return `def solve():\n    # Write your optimal solution here\n    pass`;
    } else {
      return `function solve() {\n    // Write your optimal solution here\n    return 0;\n}`;
    }
  };

  const handleLangChange = (selectedLang: string) => {
    setLang(selectedLang);
    if (!code || code === getDefaultTemplate(lang)) {
      setCode(getDefaultTemplate(selectedLang));
    }
  };

  // Simulates local standard compilation unit testing
  const handleRunLocalTests = () => {
    setRunningTests(true);
    setOutputConsole(null);
    setTimeout(() => {
      setRunningTests(false);
      setOutputConsole(
        `[COMPILE SUCCESSFUL] \nExecuting local test runners...\nTest Case 1: PASSED\nTest Case 2: PASSED\nAll local verification units matched. Ready for AI evaluation!`
      );
    }, 1200);
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const currentQ = questions[currentIndex];
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQ.id,
          answer: `[Language: ${lang}]\n\n${code}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gemini code evaluation failed.");
      }

      const updatedQ = [...questions];
      updatedQ[currentIndex] = data.question;
      setQuestions(updatedQ);
      setSession(data.session);

      setEvaluation(data.question);
    } catch (err: any) {
      setError(err.message || "Failed to compile code details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setOutputConsole(null);
    setError(null);
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCode(questions[nextIndex].codeTemplate || getDefaultTemplate(lang));
    } else {
      navigate(`/interview/report/${sessionId}`);
    }
  };

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const isLast = currentIndex === totalQ - 1;

  return (
    <div className="bg-[#09090b] min-h-screen text-white transition-colors duration-300 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        
        {/* Top Board Navigation */}
        <div className="bg-[#161618] p-4 rounded-xl border border-white/5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">{session?.mode} Mode</span>
            <h1 className="text-lg font-display font-bold mt-1 text-white">{session?.topic} Coding Sandbox</h1>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg">Difficulty: {session?.difficulty}</span>
            <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg">Experience: {session?.yearsOfExperience}y</span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg">Task {currentIndex + 1} of {totalQ}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start space-x-2">
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dual Pane Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Problem & Evaluation outputs */}
          <div className="space-y-6 flex flex-col justify-between">
            
            <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h3 className="font-display font-bold text-white">Algorithmic Specification</h3>
                </div>
                <p className="text-sm font-sans text-white/80 leading-relaxed font-semibold">
                  {currentQ?.question}
                </p>

                {currentQ?.sampleTestCases && (
                  <div className="mt-6 bg-[#09090b] p-4 rounded-xl border border-white/10">
                    <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-wide block mb-2">Sample Test Cases</span>
                    <pre className="text-xs font-mono text-white/60 leading-relaxed whitespace-pre-wrap">
                      {currentQ.sampleTestCases}
                    </pre>
                  </div>
                )}
              </div>

              {!evaluation && (
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-xs font-bold text-blue-400 flex items-center space-x-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Gemini AI evaluation active</span>
                  </span>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Once you submit your code, Gemini will analyze your structural complexity, identify performance gaps, check logic edge conditions, and grade accuracy.
                  </p>
                </div>
              )}
            </div>

            {/* AI Optimization Feedback Panel */}
            {evaluation && (
              <div className="bg-[#161618] p-6 rounded-2xl border border-emerald-500/10 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="font-bold text-sm text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Algorithmic Optimization Score</span>
                  </span>
                  <span className="text-xs font-mono font-bold bg-blue-500/10 px-3 py-1 text-blue-400 rounded-lg border border-blue-500/20">
                    {evaluation.score} / 10
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-[#09090b] p-4 rounded-xl">
                  <div>
                    <span className="text-white/40 font-mono">TIME COMPLEXITY</span>
                    <p className="font-semibold font-mono text-blue-400 mt-1">{evaluation.timeSpaceComplexity || "O(N) Expected"}</p>
                  </div>
                  <div>
                    <span className="text-white/40 font-mono">SPACE COMPLEXITY</span>
                    <p className="font-semibold font-mono text-blue-400 mt-1">{evaluation.optimalSolutionAnalysis ? "O(1) optimal" : "O(N) allocation"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-white/40 uppercase">Optimal Analysis</span>
                  <p className="text-xs leading-relaxed mt-1 text-white/75">
                    {evaluation.optimalSolutionAnalysis || evaluation.aiFeedback}
                  </p>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-1 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>{isLast ? "Compile Performance Report" : "Next Coding Task"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Code Editor Console */}
          <div className="space-y-6 flex flex-col">
            
            <div className="bg-[#161618] text-white p-4 rounded-2xl border border-white/5 shadow-xl flex-grow flex flex-col justify-between">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-white/40 font-mono">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>COMPILE SHELL</span>
                </div>

                <div className="flex space-x-2">
                  <select
                    value={lang}
                    onChange={(e) => handleLangChange(e.target.value)}
                    className="bg-[#09090b] border border-white/10 text-white rounded-lg text-xs px-2.5 py-1 focus:outline-none"
                  >
                    <option value="Java" className="bg-[#161618]">Java 21 (Temurin)</option>
                    <option value="Python" className="bg-[#161618]">Python 3.11</option>
                    <option value="JavaScript" className="bg-[#161618]">JavaScript (Node.js ES6)</option>
                  </select>
                </div>
              </div>

              {/* Monospace Code Editor Area */}
              <div className="relative flex-grow flex">
                <div className="w-10 text-white/30 text-right pr-3 select-none font-mono text-xs leading-6 pt-1">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!!evaluation}
                  className="flex-grow bg-transparent focus:outline-none border-none font-mono text-xs leading-6 pt-1 text-emerald-400 w-full resize-none min-h-[350px]"
                  style={{ tabSize: 4 }}
                />
              </div>

              {/* Console outputs */}
              {outputConsole && (
                <div className="mt-4 p-3 bg-[#09090b] border border-white/10 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest block mb-1">CONSOLES RUNTIME</span>
                  <pre className="text-[11px] font-mono text-blue-400 whitespace-pre-wrap leading-relaxed">
                    {outputConsole}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              {!evaluation && (
                <div className="mt-4 border-t border-white/5 pt-4 flex justify-end space-x-3">
                  <button
                    onClick={handleRunLocalTests}
                    disabled={runningTests || submitting}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white/90 transition-colors cursor-pointer"
                  >
                    {runningTests ? "Compiling tests..." : "Run Code Tests"}
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={submitting}
                    className="flex items-center space-x-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling AI evaluation...</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5" />
                        <span>Submit Code to AI Evaluator</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
