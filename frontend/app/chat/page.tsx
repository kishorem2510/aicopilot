"use client";
import axios from "axios";
import { Bot, ChevronDown, ChevronUp, LogOut, Send, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  similarity_scores?: number[];
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [expandedSources, setExpandedSources] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (!token) {
      router.push("/login");
      return;
    }
    setUsername(user || "User");
    setMessages([
      {
        role: "assistant",
        content: "👋 Hello! I'm your SaaS Support Copilot. Ask me anything about the platform — account settings, billing, security, and more!",
      },
    ]);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://kishorem2510-aicopilot-backend.hf.space/ask",
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
          similarity_scores: res.data.similarity_scores,
        },
      ]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        router.push("/login");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const toggleSources = (index: number) => {
    setExpandedSources((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="flex h-screen bg-[#0f0f1a]">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a2e] border-r border-purple-900/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">SaaS Copilot</h1>
              <p className="text-purple-400 text-xs">AI Support</p>
            </div>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="p-4 flex-1">
          <p className="text-gray-500 text-xs uppercase font-semibold mb-3 tracking-wider">Try asking</p>
          <div className="space-y-2">
            {[
              "How do I reset password?",
              "How to cancel subscription?",
              "How to enable 2FA?",
              "How to generate API key?",
              "How to contact support?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="w-full text-left text-xs text-gray-400 hover:text-purple-300 hover:bg-purple-900/20 px-3 py-2 rounded-lg transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-purple-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-white text-sm font-medium">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-900/30 bg-[#1a1a2e]/50">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">Support Chat</h2>
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-xs">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl ${msg.role === "user" ? "order-2" : "order-1"}`}>
                <div className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-purple-600" : "bg-[#2d2d4e]"}`}>
                    {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-purple-400" />}
                  </div>

                  <div>
                    {/* Bubble */}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-tr-sm"
                        : "bg-[#1a1a2e] border border-purple-900/30 text-gray-200 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>

                    {/* Sources with Similarity Scores */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleSources(index)}
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition"
                        >
                          {expandedSources.includes(index) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {expandedSources.includes(index) ? "Hide" : "Show"} sources ({msg.sources.length})
                        </button>

                        {expandedSources.includes(index) && (
                          <div className="mt-2 space-y-2">
                            {msg.sources.map((source, i) => (
                              <div key={i} className="bg-[#0f0f1a] border border-purple-900/20 rounded-xl p-3 text-xs text-gray-400 leading-relaxed">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-purple-500 font-semibold">Source {i + 1}</span>
                                  {msg.similarity_scores && msg.similarity_scores[i] !== undefined && (
                                    <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                      Score: {msg.similarity_scores[i]}
                                    </span>
                                  )}
                                </div>
                                {source}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2d2d4e] flex items-center justify-center">
                  <Bot size={14} className="text-purple-400" />
                </div>
                <div className="bg-[#1a1a2e] border border-purple-900/30 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-purple-900/30">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-[#1a1a2e] border border-purple-900/50 rounded-2xl px-4 py-3 focus-within:border-purple-500 transition">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question about the platform..."
                className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none max-h-32"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition shadow-lg shadow-purple-500/20"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

// Added Similarity Scores Display