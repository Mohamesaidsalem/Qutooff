import { createClient } from '@supabase/supabase-js';

// **الإصلاح:** تم تغيير الأسماء لمطابقة VITE_BOLT_DATABASE_...
const supabaseUrl = import.meta.env.VITE_BOLT_DATABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_BOLT_DATABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    url: supabaseUrl,
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error(
    'Missing Supabase environment variables. Please restart the dev server to load .env file.'
  );
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// ... احتفظ ببقية الـ Interfaces في نفس الملف