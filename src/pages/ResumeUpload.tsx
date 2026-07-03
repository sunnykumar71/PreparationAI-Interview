import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  FileText, Upload, Sparkles, Loader2, AlertCircle, 
  CheckCircle2, ArrowRight, HelpCircle, FileType 
} from "lucide-react";

export const ResumeUpload: React.FC = () => {
  const { token } = useApp();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ["application/pdf", "text/plain"];
      if (validTypes.includes(droppedFile.type) || droppedFile.name.endsWith(".pdf") || droppedFile.name.endsWith(".txt")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only PDF and TXT files are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !resumeText.trim()) {
      setError("Please drop/select a resume file or paste your resume text.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (file) {
      formData.append("resume", file);
    } else {
      formData.append("resumeText", resumeText);
    }

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      // Redirect directly to mock interview sequentially
      navigate(`/interview/mock/${data.session.id}`);
    } catch (err: any) {
      setError(err.message || "Resume upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white">AI Resume-Based Interview</h1>
          <p className="mt-2 text-white/50 text-sm max-w-xl mx-auto">
            Upload your resume PDF or copy-paste your profile text. Gemini will scan your listed tech stack, frameworks, and projects to assemble custom-made assessment rounds.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="bg-[#161618] p-8 rounded-2xl border border-white/5 shadow-lg space-y-6">
          
          {/* Drag & Drop zone */}
          {!resumeText && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-white/80">Upload PDF / TXT Resume Document</label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all bg-[#09090b] ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-white/10 hover:border-blue-500/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-white/30 mb-4" />
                {file ? (
                  <div className="text-center">
                    <span className="text-sm font-semibold text-blue-400 flex items-center justify-center space-x-1 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{file.name}</span>
                    </span>
                    <span className="text-xs text-white/40 block">{(file.size / 1024).toFixed(1)} KB • Click to swap</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-sm font-bold block mb-1 text-white">Drag and drop file here, or click to browse</span>
                    <span className="text-xs text-white/40 font-medium">Supports PDF or Plain TXT (Max 5MB)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback copy-paste area */}
          {!file && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-white/80">Or Paste Resume Raw Text Profile</label>
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => setResumeText("")}
                    className="text-xs text-red-400 hover:text-red-500 cursor-pointer"
                  >
                    Clear Text fallback
                  </button>
                )}
              </div>
              <textarea
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your professional experience, summary, frameworks list, and projects descriptions here to compile bespoke rounds..."
                className="w-full p-4 bg-[#09090b] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-white"
              />
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/20 flex justify-center items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scanning resume details and assembling custom targets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Launch Resume-Based Interview Round</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
