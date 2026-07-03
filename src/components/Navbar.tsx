import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Sun, Moon, LogOut, Award, FileText, LayoutDashboard, Play, User as UserIcon, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Start Interview", path: "/interview/start", icon: Play },
    { name: "Resume Upload", path: "/resume/upload", icon: FileText },
    { name: "Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 border-b border-white/10 bg-[#161618]/90 backdrop-blur-md text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 text-xl font-bold font-sans tracking-tight">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">
                <Award className="w-5 h-5" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                PrepAI
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full font-normal border border-white/10 text-white/50">
                v1.2
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(link.path)
                          ? "bg-blue-600/10 border border-blue-500/30 text-blue-400 font-semibold"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Global Actions */}
            <div className="flex items-center space-x-3 border-l border-white/10 pl-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-white/90">{user.name}</span>
                    <span className="text-[10px] text-white/40 font-mono">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-950/30 text-red-400 hover:bg-red-950/50 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md hover:shadow-blue-500/20 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white/60 hover:bg-white/5 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#161618] transition-all duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium ${
                        isActive(link.path)
                          ? "bg-blue-600/15 border border-blue-500/20 text-blue-400"
                          : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                <div className="border-t border-white/10 mt-3 pt-3 px-3 flex flex-col space-y-2">
                  <div className="flex flex-col mb-1">
                    <span className="text-sm font-semibold text-white/90">{user.name}</span>
                    <span className="text-xs text-white/40 font-mono">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 bg-red-950/30 text-red-400 rounded-lg text-base font-medium hover:bg-red-950/50 border border-red-500/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 p-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white/70 hover:bg-white/5 border border-white/10 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
