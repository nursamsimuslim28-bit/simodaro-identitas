/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import LockScreen from './components/LockScreen';
import IdentityForm from './components/IdentityForm';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/auth';
import { loadIdentityFromDrive, saveIdentityToDrive } from './lib/drive';
import { SchoolIdentity } from './types';
import { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';

export default function App() {
  // SIMULASI: Gunakan GuruID simulasi untuk mode pengembangan jika tidak ada dari URL
  const SIMULATION_GURUID = import.meta.env.DEV ? "GURU-AM-2D565" : null;
  
  const [guruId, setGuruId] = useState<string | null>(SIMULATION_GURUID);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [identityData, setIdentityData] = useState<Partial<SchoolIdentity> | null>(null);

  useEffect(() => {
    // Check URL first
    const params = new URLSearchParams(window.location.search);
    const urlGuruId = params.get('guruId');
    const urlTheme = params.get('theme');
    
    if (urlGuruId) {
      setGuruId(urlGuruId);
    }
    if (urlTheme === 'light' || urlTheme === 'dark') {
      setTheme(urlTheme);
    }

    // Listen for postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.guruId) {
          setGuruId(event.data.guruId);
        }
        if (event.data.theme === 'light' || event.data.theme === 'dark') {
          setTheme(event.data.theme);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Init Auth
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setNeedsAuth(false);
        const activeGuruId = urlGuruId || SIMULATION_GURUID || guruId;
        if (activeGuruId) {
          loadData(token, activeGuruId);
        }
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );

    return () => {
      window.removeEventListener('message', handleMessage);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadData = async (token: string, currentGuruId: string) => {
    setIsLoading(true);
    try {
      const data = await loadIdentityFromDrive(token, currentGuruId);
      if (data) {
        setIdentityData(data);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result && guruId) {
        setNeedsAuth(false);
        setUser(result.user);
        loadData(result.accessToken, guruId);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleSave = async (data: SchoolIdentity) => {
    const token = await getAccessToken();
    if (!token || !guruId) return;
    await saveIdentityToDrive(token, guruId, data);
    setIdentityData(data);
  };

  const themeWrapperClass = theme === 'dark' 
    ? 'theme-dark min-h-screen bg-[#0B1226] text-slate-100 font-sans transition-colors duration-300'
    : 'theme-light min-h-screen bg-[#E2E8F0] text-[#0F172A] font-sans transition-colors duration-300';

  if (!guruId) {
    return <LockScreen theme={theme} />;
  }

  if (needsAuth) {
    return (
      <div className={`${themeWrapperClass} flex flex-col items-center justify-center p-4`}>
        <div className={`max-w-md w-full border rounded-2xl p-10 shadow-2xl text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Otorisasi Drive</h1>
          <p className={`mb-8 leading-relaxed text-justify ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Silakan masuk dengan akun Google Anda untuk memberikan akses penyimpanan identitas modul pada Google Drive SMAN 1 Amonggedo.
          </p>
          <button 
            onClick={handleLogin}
            className={`w-full flex items-center justify-center font-bold py-4 px-6 rounded-xl transition-all shadow-lg border ${theme === 'dark' ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-700' : 'bg-[#0F172A] text-white hover:bg-slate-800 border-[#0F172A]'}`}
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 mr-3">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${themeWrapperClass} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-emerald-500' : 'border-slate-900'}`}></div>
      </div>
    );
  }

  return (
    <div className={themeWrapperClass}>
      <div className="bg-slate-950 text-slate-100 py-4 px-6 flex justify-between items-center shadow-sm relative z-10 border-b border-slate-800">
        <div className="font-bold tracking-wide flex items-center">
           siModArO <span className="mx-3 text-slate-500">/</span> <span className="text-emerald-400">Identitas Guru</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-mono text-slate-400 hidden md:block">{user?.email}</span>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl transition-all font-medium border border-slate-700"
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button 
            onClick={logout}
            className="flex items-center text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      <main className="p-4 md:p-8">
        <IdentityForm guruId={guruId} initialData={identityData} onSave={handleSave} theme={theme} />
      </main>
    </div>
  );
}
