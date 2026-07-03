import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Sparkles, HelpCircle, BookOpen, Clock, Play, Award, 
  Terminal, ShieldCheck, Cpu, MessageSquare, Flame 
} from "lucide-react";

export const StartInterview: React.FC = () => {
  const { token } = useApp();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("Java");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [mode, setMode] = useState("Technical Interview");
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicsList = [
    "Java", "Spring Boot", "Spring Security", "Hibernate & JPA", "SQL", "MySQL", 
    "React.js", "JavaScript", "HTML & CSS", "REST APIs", "Microservices", 
    "Docker", "AWS Basics", "Data Structures & Algorithms", "Operating Systems", 
    "DBMS", "Computer Networks", "HR Interview", "Aptitude", "Custom Topic"
  ];

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  const interviewModes = [
    { name: "Technical Interview", desc: "Standard verbal technical assessment checking architecture, concepts, and algorithms.", icon: Cpu },
    { name: "HR Interview", desc: "Assess behavioral traits, problem solving, teamwork, STAR structure, and soft skills.", icon: MessageSquare },
    { name: "Mock Interview", desc: "Sequential live conversational simulation asking follow-up questions sequentially.", icon: Sparkles },
    { name: "Coding Interview", desc: "Technical test case based session inside an interactive code compiler terminal.", icon: Terminal },
    { name: "Rapid Fire Round", desc: "Fast-paced immediate conceptual evaluation with short time limits.", icon: Flame }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const activeTopic = topic === "Custom Topic" ? customTopic : topic;
    if (topic === "Custom Topic" && !customTopic.trim()) {
      setError("Please specify your custom topic.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: activeTopic,
          difficulty,
          mode,
          yearsOfExperience,
          totalQuestions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize interview.");
      }

      // Redirect based on selected interview mode
      const redirectPath = mode === "Coding Interview"
        ? `/interview/coding/${data.session.id}`
        : `/interview/mock/${data.session.id}`;
      
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">Configure Your Interview Session</h1>
          <p className="mt-2 text-white/60 text-sm max-w-xl mx-auto">
            Choose your target topic, level of experience, and interview round format. Our Gemini AI will assemble tailored technical questions.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#161618] p-8 rounded-2xl border border-white/5 shadow-xl space-y-8">
          
          {/* Topic selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Target Subject Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {topicsList.map((t) => (
                  <option key={t} value={t} className="bg-[#161618] text-white">{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyLevels.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      difficulty === d
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "border-white/10 bg-[#09090b] text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom topic sub-input */}
          {topic === "Custom Topic" && (
            <div className="p-4 bg-[#09090b]/40 rounded-xl border border-white/10">
              <label className="block text-sm font-semibold mb-2 text-white/80">Define Your Custom Subject Topic</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Kotlin Concurrency, System Design (Distributed Cache)"
                className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Interview Format Modes */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white/80">Interview Format Round</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewModes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setMode(item.name)}
                    className={`flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer group ${
                      mode === item.name
                        ? "bg-blue-500/10 border-blue-500 shadow-sm"
                        : "border-white/5 bg-[#09090b]/40 hover:bg-[#09090b]/80"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg mr-3.5 flex-shrink-0 transition-colors ${
                      mode === item.name 
                        ? "bg-blue-600 text-white" 
                        : "bg-white/5 text-white/50 group-hover:bg-white/10"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numerical Configs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center text-white/80">
                <Clock className="w-4 h-4 text-white/40 mr-1.5" />
                <span>Candidate Years of Experience</span>
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center text-white/80">
                <BookOpen className="w-4 h-4 text-white/40 mr-1.5" />
                <span>Number of Questions (1 - 10)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin" />
                  <span>Gemini is compiling dynamic question blueprints...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Launch Custom Interview Session</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
