'use client';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Landing() {
  return (
    <div 
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) alert(error.message);
      }}
    >
      <img 
        src="/landing-hero.jpg" 
        alt="Ai-Assists" 
        className="w-screen h-screen object-cover"
      />
    </div>
  );
}
