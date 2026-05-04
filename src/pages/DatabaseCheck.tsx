import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DatabaseCheck() {
  const [status, setStatus] = useState<'checking' | 'error' | 'success'>('checking');
  const [message, setMessage] = useState('Checking database schema...');

  useEffect(() => {
    async function checkDB() {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          setStatus('error');
          setMessage(`❌ Database error: ${error.message}\n\nYour Supabase schema is not initialized.\n\n1. Go to https://app.supabase.com\n2. Open SQL Editor\n3. Copy/paste schema.sql\n4. Click Run\n5. Reload this page`);
          return;
        }
        setStatus('success');
        setMessage('✅ Database connected! Redirecting...');
        setTimeout(() => window.location.reload(), 2000);
      } catch (e: any) {
        setStatus('error');
        setMessage(`❌ Connection failed: ${e.message}`);
      }
    }
    checkDB();
  }, []);

  if (status === 'success') {
    return (
      <div className="h-screen w-full bg-[#f3efe6] flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
          <h1 className="font-mono text-2xl font-bold mb-2">Connected!</h1>
          <p className="text-sm text-gray-600">Loading arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f3efe6] flex items-center justify-center p-6">
      <div className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000]">
        <div className="flex gap-3 items-start mb-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-bold text-lg mb-2">Setup Required</h2>
            <p className="text-sm whitespace-pre-wrap font-mono text-xs">{message}</p>
          </div>
        </div>

        <div className="mt-6 p-4 border-2 border-black bg-[#fff9e6]">
          <p className="text-xs font-bold mb-2">Quick Setup:</p>
          <ol className="text-xs space-y-1 font-medium">
            <li>1. Open schema.sql in your project</li>
            <li>2. Go to Supabase SQL Editor</li>
            <li>3. Copy all SQL, run it</li>
            <li>4. Reload this page</li>
          </ol>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full mt-4 bg-black text-white font-bold py-2 border-2 border-black active:translate-y-1"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
