"use client";

import { useState } from "react";
import { Shield, Copy, RefreshCw, Lock, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("P@ssword123!");
  const [length, setLength] = useState(16);

  const generate = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(retVal);
    toast.success("New Secure Password Generated");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h1 className="text-3xl font-black tracking-tighter uppercase">Security <span className="text-slate-400">Vault</span></h1>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl space-y-8 shadow-2xl">
          <div className="bg-black border border-white/5 p-6 rounded-2xl flex items-center justify-between">
            <span className="font-mono text-xl text-slate-300 break-all">{password}</span>
            <button onClick={() => { navigator.clipboard.writeText(password); toast.success("Copied!"); }}>
              <Copy className="h-5 w-5 text-slate-500 hover:text-white transition-colors" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase text-neutral-500">
              <span>Entropy Length</span>
              <span className="text-slate-300">{length} Chars</span>
            </div>
            <input 
              type="range" min="8" max="32" value={length} onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-slate-400"
            />
          </div>

          <Button className="w-full h-14 bg-slate-200 hover:bg-white text-black font-black" onClick={generate}>
            <RefreshCw className="mr-2 h-4 w-4" /> GENERATE KEY
          </Button>
        </div>
      </div>
    </div>
  );
}