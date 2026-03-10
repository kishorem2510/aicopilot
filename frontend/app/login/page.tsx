"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { Bot, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://kishorem2510-aicopilot-backend.hf.space/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", form.username);
      toast.success("Welcome back!");
      router.push("/chat");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen flex bg-[#0f0f1a]">
    
    {/* Left Panel */}
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#1a1a2e] border-r border-purple-900/30 p-12">
      <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
        <Bot size={40} className="text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4 text-center">NS AI Copilot</h2>
      <p className="text-gray-400 text-center max-w-sm leading-relaxed">
        Your intelligent support assistant. Get instant, accurate answers powered by AI.
      </p>
      <div className="mt-10 space-y-4 w-full max-w-sm">
        {["Instant AI-powered answers", "Grounded in your documentation", "Secure & authenticated access"].map((feature) => (
          <div key={feature} className="flex items-center gap-3 bg-purple-900/20 border border-purple-900/30 rounded-xl px-4 py-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Right Panel - Login Form */}
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-3 md:hidden">
            <Bot size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-[#1a1a2e] border border-purple-900/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full bg-[#0f0f1a] border border-purple-900 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-[#0f0f1a] border border-purple-900 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
}