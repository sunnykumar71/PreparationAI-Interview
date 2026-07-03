import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Award, Terminal, Play, CheckCircle, ShieldAlert, Cpu, ListCollapse, FileText, BarChart3, Clock, Sparkles } from "lucide-react";

export const Home: React.FC = () => {
  const { user } = useApp();

  const features = [
    {
      title: "AI Question Generator",
      desc: "Instant dynamic generation based on 20+ specialized topics (Java, Spring, System Design, SQL, React), experience level, and desired difficulty.",
      icon: Cpu,
    },
    {
      title: "Granular Scoring",
      desc: "Get instantaneous feedback with technical scoring (0-10), highlight of missed points, communication tips, and optimal explanation blueprints.",
      icon: Award,
    },
    {
      title: "Interactive Coding Editor",
      desc: "Simulate a live Coding Interview! Solve programming puzzles inside a clean code terminal with test cases, complexity breakdowns, and algorithmic analysis.",
      icon: Terminal,
    },
    {
      title: "Simulated Mock Sessions",
      desc: "Live mock interview simulator mimicking a human tech lead. It asks questions sequentially and probes your depth using smart follow-up prompts.",
      icon: Sparkles,
    },
    {
      title: "Resume-Based Focus",
      desc: "Upload your PDF or text resume. The AI automatically scans your listed tech-stack, libraries, and projects, compiling bespoke interview targets.",
      icon: FileText,
    },
    {
      title: "Performance Analytics",
      desc: "Track completed interviews, average rating scores, topic-wise strengths and weaknesses, and historic improvement curves visually with charts.",
      icon: BarChart3,
    },
  ];

  const topics = [
    "Java", "Spring Boot", "Spring Security", "Hibernate & JPA", "SQL & MySQL",
    "React.js", "JavaScript", "HTML & CSS", "REST APIs", "Microservices",
    "Docker", "AWS Basics", "DSA", "Operating Systems", "Computer Networks", "HR Topics"
  ];

  return (
    <div className="bg-[#09090b] text-white min-h-screen transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 lg:py-32 border-b border-white/5 bg-gradient-to-b from-[#161618] to-[#09090b]">
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.05))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600/10 text-blue-400 rounded-full text-xs font-semibold mb-6 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>State-of-the-Art Generative AI Evaluator</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Accelerate Your Tech Interview Prep with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Gemini AI</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto font-sans font-normal leading-relaxed">
            The ultimate full-stack simulator for Java developers, React architects, and computer engineers. Practice custom rounds, evaluate code complexity, and track weak zones.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/20 transition-all text-base w-full sm:w-auto justify-center"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/20 transition-all text-base w-full sm:w-auto justify-center"
                >
                  <span>Start Preparing Now</span>
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 bg-white/5 text-white/90 hover:bg-white/10 rounded-xl font-medium transition-colors text-base border border-white/10 w-full sm:w-auto text-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Core Info Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/40 font-mono">
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>20+ Topics Included</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Evaluation</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Feedback</span>
            </span>
          </div>
        </div>
      </div>

      {/* Topics Covered Grid */}
      <div className="py-20 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold tracking-tight text-white">
            Bespoke Modules for Every Technology
          </h2>
          <p className="mt-3 text-white/50 max-w-xl mx-auto text-sm">
            Tailored interviews covering both foundational topics and complex microservice environments.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {topics.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold hover:border-blue-500/50 hover:bg-white/10 text-white/85 transition-all cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Comprehensive Interview Engine
          </h2>
          <p className="mt-4 text-white/60 text-base leading-relaxed">
            Engineered to challenge your technical prowess, perfect your communication style, and align your responses with industry leader templates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-[#161618] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl inline-block mb-6 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Warning / Technical Scope Info */}
      <div className="py-12 bg-[#161618] border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Clock className="w-8 h-8 text-blue-500 mb-4 animate-pulse" />
          <h4 className="text-lg font-bold text-blue-400 mb-2">Dual Mode Execution Framework</h4>
          <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
            The live sandbox features a local JSON database synchronization cache, keeping your user session robust inside the browser preview. Full Java Spring Boot project files and MySQL schemas are included directly in the export package for server deployment!
          </p>
        </div>
      </div>
    </div>
  );
};
