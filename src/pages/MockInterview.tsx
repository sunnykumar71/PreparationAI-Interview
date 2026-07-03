import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Award, Sparkles, Send, Brain, AlertCircle, ChevronRight, 
  HelpCircle, CheckCircle2, ChevronLeft, ArrowRight, Loader2 
} from "lucide-react";

export const MockInterview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token } = useApp();
  const navigate = useNavigate();

  const [session, setSession] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(true);
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
        } else {
          // If all answered, show last
          setCurrentIndex(data.questions.length - 1);
          setEvaluation(data.questions[data.questions.length - 1]);
        }

      } catch (err: any) {
        setError(err.message || "Failed to load interview components.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, token, navigate]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError("Please write down your answer before submitting.");
      return;
    }

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
          answer: userAnswer
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Answer evaluation failed.");
      }

      // Update question array locally with feedback
      const updatedQ = [...questions];
      updatedQ[currentIndex] = data.question;
      setQuestions(updatedQ);
      setSession(data.session);

      setEvaluation(data.question);
    } catch (err: any) {
      setError(err.message || "Failed to submit answer to Gemini.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswer("");
    setError(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions! Go to reports
      navigate(`/interview/report/${sessionId}`);
    }
  };

  const handleSkipQuestion = () => {
    setEvaluation(null);
    setUserAnswer("[Candidate skipped this question]");
    // Auto submit placeholder
    setTimeout(() => {
      handleSubmitAnswer();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(screen-16)] bg-[#09090b] text-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <span className="text-white/40 font-mono text-sm">Spawning AI examiner agents...</span>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const isLast = currentIndex === totalQ - 1;

  return (
    <div className="bg-[#09090b] min-h-screen text-white transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Session Header Cards */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">{session?.mode}</span>
            <h1 className="text-xl font-display font-bold mt-1 text-white">{session?.topic} Board Simulator</h1>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg">Difficulty: {session?.difficulty}</span>
            <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-lg">Experience: {session?.yearsOfExperience}y</span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg">Question {currentIndex + 1} of {totalQ}</span>
          </div>
        </div>

        {/* Progress Bar indicator */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-8">
          <div 
            className="bg-blue-500 h-full transition-all duration-350"
            style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Interview Panel */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Question Display */}
          <div className="bg-[#161618] p-8 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl flex-shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-white/40 block font-mono font-bold uppercase">QUESTION {currentIndex + 1}</span>
                <p className="text-lg font-display font-bold mt-1.5 leading-relaxed text-white">
                  {currentQ?.question}
                </p>
              </div>
            </div>

            {/* Answer Input Textarea */}
            {!evaluation ? (
              <div className="mt-8">
                <label className="block text-sm font-semibold mb-2 text-white/80">Your Answer Response</label>
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your technical response in details. Mention design models, edge conditions, and production experiences for higher points..."
                  className="w-full p-4 bg-[#09090b] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-white"
                />

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={handleSkipQuestion}
                    disabled={submitting}
                    className="text-xs text-white/40 hover:text-white/70 font-semibold cursor-pointer"
                  >
                    Skip Question (Score: 1)
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-[#09090b]/30 rounded-xl border border-white/5 text-center">
                <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Answer successfully submitted and evaluated! See feedback below.</span>
                </span>
              </div>
            )}
          </div>

          {/* AI Feedback Panel (Shows after user submits) */}
          {evaluation && (
            <div className="bg-[#161618] p-8 rounded-2xl border border-emerald-500/10 shadow-md space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-display font-bold">Real-Time Evaluation Results</h2>
                </div>
                
                <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-xl text-blue-400">
                  <span className="text-xs text-white/40 font-mono">GRADE SCORE:</span>
                  <span className="font-mono text-lg font-bold">{evaluation.score} / 10</span>
                </div>
              </div>

              {/* overall feedback summary */}
              <div>
                <h3 className="text-xs font-bold font-mono uppercase text-white/40 mb-2">AI Summary Feedback</h3>
                <p className="text-sm leading-relaxed text-white/80 bg-[#09090b] p-4 rounded-xl border border-white/5">
                  {evaluation.aiFeedback}
                </p>
              </div>

              {/* correctAnswer explanation */}
              <div>
                <h3 className="text-xs font-bold font-mono uppercase text-white/40 mb-2">Ideal Expert Answer Blueprint</h3>
                <div className="text-sm leading-relaxed text-white/70 border-l-4 border-blue-500 pl-4">
                  {evaluation.correctAnswer}
                </div>
              </div>

              {/* Missing points & suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-rose-400 mb-2">Gaps / Missing Points</h3>
                  <ul className="space-y-2 text-xs">
                    {evaluation.missingPoints && evaluation.missingPoints.length > 0 ? (
                      evaluation.missingPoints.map((pt: string, idx: number) => (
                        <li key={idx} className="flex items-start text-white/50">
                          <span className="text-rose-400 mr-2 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-emerald-400">Perfect alignment! No significant technical gaps found.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-emerald-400 mb-2">Suggestions for Improvement</h3>
                  <ul className="space-y-2 text-xs">
                    {evaluation.suggestions && evaluation.suggestions.length > 0 ? (
                      evaluation.suggestions.map((pt: string, idx: number) => (
                        <li key={idx} className="flex items-start text-white/50">
                          <span className="text-emerald-400 mr-2 font-bold">→</span>
                          <span>{pt}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-white/40">Answer is already at maximum executive detail.</li>
                    )}
                  </ul>
                </div>

              </div>

              {/* Next navigation */}
              <div className="border-t border-white/5 pt-6 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>{isLast ? "Compile Performance Report" : "Proceed to Next Question"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
