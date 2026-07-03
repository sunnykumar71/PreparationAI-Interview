import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { User, Award, CheckCircle2, ShieldCheck, Mail, Calendar, HelpCircle, Loader2 } from "lucide-react";

export const Profile: React.FC = () => {
  const { token, user } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simulated profile fields
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user) {
      setName(user.name);
    }

    const fetchProfileStats = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const stats = await res.json();
          setSessionCount(stats.totalInterviews);
        }
      } catch (err) {
        console.error("Failed to fetch profile stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, [token, user, navigate]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage(null);

    // Simulate database write
    setTimeout(() => {
      setUpdating(false);
      setSuccessMessage("Your profile information was updated successfully.");
      setNewPassword("");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(screen-16)] bg-[#09090b] text-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <span className="text-white/40 font-mono text-sm">Loading profile parameters...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] min-h-screen text-white transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Banner header */}
        <div className="bg-[#161618] p-8 rounded-2xl border border-white/5 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center text-3xl font-bold font-sans shadow-md">
            {user?.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
            <span className="text-xs text-white/40 font-mono block mt-0.5">{user?.email}</span>
            <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 mt-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Premium AI Candidate Account</span>
            </span>
          </div>
        </div>

        {/* Success Feedback banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Two columns: details edit & metadata info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Info cards columns */}
          <div className="md:col-span-1 space-y-6">
            
            <div className="bg-[#161618] p-6 rounded-2xl border border-white/5 shadow-sm space-y-4">
              <h2 className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest">Account Details</h2>
              
              <div className="flex items-center space-x-3 text-xs text-white/70">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="truncate">{user?.email}</span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-white/70">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026"}</span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-white/70">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Completed Rounds: {sessionCount}</span>
              </div>
            </div>

            <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
              <span className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider block mb-1">System Node</span>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Your credentials are statefully hashed and managed in a local synchronous database environment.
              </p>
            </div>

          </div>

          {/* Form edit column */}
          <div className="md:col-span-2 bg-[#161618] p-8 rounded-2xl border border-white/5 shadow-sm">
            <h2 className="text-lg font-display font-bold mb-6 text-white">Modify Credentials Profile</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Email Address (Read Only)</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-3 py-2.5 bg-[#09090b]/50 text-white/30 border border-white/5 rounded-xl text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">New Reset Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to preserve current"
                  className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving updates...</span>
                    </>
                  ) : (
                    <span>Save Profile Updates</span>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
