'use client';
 
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';   // we'll use later if needed, but not required for Checkout redirect

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default function WanderAI() {


  // Auth
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'search' | 'trips'>('search');

  // Search states
  const [journeyType, setJourneyType] = useState<'one_way' | 'return'>('return');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [depart, setDepart] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('');   // '' = Any Class
  const [offers, setOffers] = useState<any[]>([]);
const [showManageModal, setShowManageModal] = useState(false);
const [selectedTripForManage, setSelectedTripForManage] = useState<any>(null);
 const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
 const [remainingIdeas, setRemainingIdeas] = useState(20); 
 const [userIsPro, setUserIsPro] = useState(false);
 const [remainingBookingMessages, setRemainingBookingMessages] = useState(100);
 // ====================== SUCCESS BANNER FROM STRIPE ======================
const [showSuccessBanner, setShowSuccessBanner] = useState(false);

React.useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    setShowSuccessBanner(true);
    window.history.replaceState({}, '', window.location.pathname);

    // Refresh Pro status + remaining ideas so the badge appears immediately
    checkRemainingIdeas();
  }
}, []);
 // Airport suggestions
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
const [loadingTrips, setLoadingTrips] = useState(false);
  // Modal for flight confirmation
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
const [chatMessages, setChatMessages] = useState<any[]>([]);
const [chatInput, setChatInput] = useState('');
const [isAiLoading, setIsAiLoading] = useState(false);
const [showIdeasModal, setShowIdeasModal] = useState(false);
const [showUpgradeModal, setShowUpgradeModal] = useState(false);
const [ideaDestination, setIdeaDestination] = useState('');
const [ideaResults, setIdeaResults] = useState('');
const [isIdeasLoading, setIsIdeasLoading] = useState(false);
const sendMessageToAI = async (message: string) => {
  if (!message.trim()) return;

  if (!userIsPro) {
    alert("AI Booking Helper is only available for Pro users.");
    return;
  }

  if (!user?.id) {
    alert("User not logged in.");
    return;
  }

  const userMessage = { role: 'user', content: message };
  setChatMessages(prev => [...prev, userMessage]);
  setChatInput('');
  setIsAiLoading(true);

  try {
    const res = await fetch('/api/ai/manage-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        bookingContext: {
          booking_reference: selectedTripForManage?.booking_reference,
          status: selectedTripForManage?.status,
          airline: selectedTripForManage?.slices?.[0]?.segments?.[0]?.marketing_carrier?.name,
        },
        userId: user.id,                    // ← This line must be here
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 429) {
        alert("You've reached your monthly limit of 100 AI Booking Helper messages.");
      } else {
        alert(data.error || "Something went wrong.");
      }
      setChatMessages(prev => prev.slice(0, -1));
      return;
    }

    if (data.response) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } else {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't get a response right now." }]);
    }

  } catch (error) {
    setChatMessages(prev => [...prev, { role: 'assistant', content: "There was an error contacting the AI." }]);
  } finally {
    setIsAiLoading(false);
  }
};

  const fetchSavedIdeas = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from('saved_ideas')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    setSavedIdeas(data);
  }
};
  // ====================== NEW: formatDuration helper (clean, no duplicates) ======================
  const formatDuration = (isoDuration?: string): string => {
    if (!isoDuration) return '—';
    const hoursMatch = isoDuration.match(/(\d+)H/);
    const minutesMatch = isoDuration.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
  };
  // ====================== NEW HELPER: Baggage summary from API ======================
  const getBaggageSummary = (offer: any): string => {
    if (!offer) return "1 carry-on + 1 checked bag included per passenger";
    
    // Try to read real baggage from Duffel API response
    const firstSlice = offer.slices?.[0];
    const firstSegment = firstSlice?.segments?.[0];
    const passengerBags = firstSegment?.passengers?.[0]?.baggages || [];
    
    let carry = 1;
    let checked = 1;
    
    passengerBags.forEach((b: any) => {
      if (b.type === 'carry_on' || b.type === 'cabin') carry = Math.max(carry, b.quantity || 1);
      if (b.type === 'checked') checked = Math.max(checked, b.quantity || 1);
    });
    
    return `${carry} carry-on + ${checked} checked bag${checked > 1 ? 's' : ''} included per passenger`;
  };
  // Load user
 React.useEffect(() => {
  // Get current user
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  getUser();

  
  // Listen for auth changes (fixes Google login redirect)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);

 // ====================== AUTO LOAD PRO STATUS ON LOGIN ======================
React.useEffect(() => {
  if (user) {
    checkRemainingIdeas();
  }
}, [user]);
  // Fetch trips when user switches to My Trips tab
React.useEffect(() => {
  const fetchTrips = async () => {
    if (currentView !== 'trips' || !user) {
      return;
    }

    setLoadingTrips(true);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrips(data);
    } else if (error) {
      console.error('Error fetching trips:', error);
    }

    setLoadingTrips(false);
  };

  fetchTrips();
  fetchSavedIdeas();
}, [currentView, user]);
  
const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};

  // Airport suggestions
  const fetchSuggestions = async (query: string, setSuggestions: any, setShow: any) => {
  if (query.length < 2) {
    setSuggestions([]);
    setShow(false);
    return;
  }
  try {
    const res = await fetch(`/api/places/suggestions?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSuggestions(data.places?.slice(0, 8) || []);
    setShow(true);
  } catch (e) {
    console.error(e);
  }
};

  // Search flights
  const handleRealSearch = async () => {
  if (!from || !to || !depart) {
    alert('Please fill in From, To and Departure date');
    return;
  }

  try {
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from,
        to: to,
        departDate: depart,
        returnDate: journeyType === 'return' ? returnDate : undefined,
        passengers: passengers,
        cabinClass: cabinClass,
      }),
    });

    const data = await res.json();

    if (data.success && data.offers && data.offers.length > 0) {
      setOffers(data.offers);
    } else {
      alert(data.error || 'No flights found');
    }
  } catch (error) {
    console.error(error);
    alert('Search failed');
  }
};

  // Create Duffel Link and redirect
  const createDuffelLink = async (offerId: string) => {
  if (!user) {
    alert('You must be logged in to book');
    return;
  }    
  try {
    // 1. Save a pending booking record first (so webhook can update it later)
    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user.id,
      offer_id: offerId,
      status: 'pending_payment',
      slices: selectedFlight.slices,
      passengers: selectedFlight.passengers,
      total_amount: selectedFlight.total_amount,
      total_currency: selectedFlight.total_currency || 'GBP',
      raw_offer: selectedFlight,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Failed to save pending booking:', insertError);
    }

    // 2. Create Duffel payment link
    const res = await fetch('/api/duffel/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_offers: [offerId],
      }),
    });

    const result = await res.json();

    if (result.success && result.link_url) {
      window.location.href = result.link_url;
    } else {
      alert('Error creating booking link: ' + (result.error || 'Unknown error'));
      console.error(result);
    }
  } catch (error) {
    alert('Failed to create booking link');
    console.error(error);
  }
};

  // Open Manage Booking Modal (Pro only for AI chat)
const openManageBooking = (trip: any) => {
  setSelectedTripForManage(trip);
  setChatMessages([]);
  setChatInput('');
  setShowManageModal(true);

  // Fetch remaining booking helper messages
  if (userIsPro) {
    checkBookingHelperUsage();
  }
};
  const saveIdea = async () => {
  if (!user || !ideaDestination.trim() || !ideaResults.trim()) {
    alert("Nothing to save");
    return;
  }

  try {
    const { error } = await supabase.from('saved_ideas').insert({
      user_id: user.id,
      title: ideaDestination,
      content: ideaResults,
    });

    if (error) {
      console.error('Error saving idea:', error);
      alert('Failed to save idea');
    } else {
      alert('Idea saved successfully!');
      // Optional: clear results after saving
      // setIdeaResults('');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong while saving');
  }
};
   
   const getTripIdeas = async () => {
  if (!ideaDestination.trim() || !user) return;

  setIsIdeasLoading(true);
  setIdeaResults('');

  try {
    // 1. Check if user is Pro (defensive)
    let isPro = false;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

      console.log("DEBUG → profile data:", profile);
      console.log("DEBUG → is_pro value:", profile?.is_pro);

      isPro = profile?.is_pro === true;
    } catch (e) {
      console.error("Profile check error:", e);
      isPro = false;
    }

    if (!isPro) {
      setIdeaResults("This feature is only available on the Pro plan (£2.99/month).");
      setIsIdeasLoading(false);
      return;
    }

    // 2. Check monthly usage limit (20)
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: usageData } = await supabase
      .from('feature_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature', 'trip_ideas')
      .eq('month', currentMonth)
      .single();

    const currentCount = usageData?.count || 0;

    if (currentCount >= 20) {
      setIdeaResults("You've reached your limit of 20 AI Trip Ideas this month.");
      setIsIdeasLoading(false);
      return;
    }

    // 3. Call the AI
    const res = await fetch('/api/ai/trip-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: ideaDestination }),
    });

    const data = await res.json();

    if (data.response) {
      setIdeaResults(data.response);

      // 4. Increment usage count
      if (usageData) {
        await supabase
          .from('feature_usage')
          .update({ count: currentCount + 1, updated_at: new Date().toISOString() })
          .eq('id', usageData.id);
      } else {
        await supabase.from('feature_usage').insert({
          user_id: user.id,
          feature: 'trip_ideas',
          count: 1,
          month: currentMonth,
        });
      }
    } else {
      setIdeaResults("Sorry, I couldn't generate ideas right now.");
    }
  } catch (error) {
    console.error(error);
    setIdeaResults("There was an error getting ideas.");
  } finally {
    setIsIdeasLoading(false);
  }
};

 const checkRemainingIdeas = async () => {
  if (!user) return;

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Check Pro status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single();

  setUserIsPro(profile?.is_pro === true);

  // Check usage
  const { data: usage } = await supabase
    .from('feature_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('feature', 'trip_ideas')
    .eq('month', currentMonth)
    .single();

  const used = usage?.count || 0;
  setRemainingIdeas(20 - used);
};
 // ====================== CHECK BOOKING HELPER USAGE ======================
const checkBookingHelperUsage = async () => {
  if (!user) return;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: usage } = await supabase
    .from('feature_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('feature', 'booking_helper')
    .eq('month', currentMonth)
    .single();

  const used = usage?.count || 0;
  setRemainingBookingMessages(100 - used);
};
 
return (
        <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
         {/* ====================== STRIPE SUCCESS BANNER ====================== */}
{showSuccessBanner && (
  <div className="bg-emerald-600 text-white">
    <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <span className="font-semibold">Thank you!</span> Your Pro plan is now active.
          <span className="ml-2 text-emerald-100">You now have 20 AI Trip Ideas per Month + full Booking Helper access.</span>
        </div>
      </div>
      <button
        onClick={() => setShowSuccessBanner(false)}
        className="text-emerald-100 hover:text-white text-xl leading-none px-2"
      >
        ×
      </button>
    </div>
  </div>
)}
      <div className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
  <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
    <span className="font-bold text-xl">W</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="font-semibold text-xl">Ai-Assists</div>
    <div className="text-[10px] text-zinc-500 -mt-1">Smart Flight Booking</div>
    
    {/* PRO Badge next to title */}
    {userIsPro && (
      <div className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded tracking-wider">
        PRO
      </div>
    )}
  </div>
           {/* Subtitle underneath */}
    <div className="text-[10px] text-zinc-500 -mt-1">Smart Flight Booking</div>
</div>

          <div className="flex items-center gap-4">
            {user && (
  <>
    <button 
      onClick={() => setCurrentView('search')} 
      className={`px-4 py-2 rounded-xl text-sm ${currentView === 'search' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
    >
      Search
    </button>
    <button 
      onClick={() => setCurrentView('trips')} 
      className={`px-4 py-2 rounded-xl text-sm ${currentView === 'trips' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
    >
      My Trips
    </button>
    <button
      onClick={() => {
        setShowIdeasModal(true);
        checkRemainingIdeas();
      }}
      className="px-4 py-2 rounded-xl text-sm hover:bg-zinc-900"
    >
      AI Ideas
    </button>

   {/* Manage Subscription Button (only for Pro users) */}
{userIsPro && (
  <button
    onClick={async () => {
      if (!user) return;
      
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Portal
      } else {
        alert("Could not open subscription management");
      }
    }}
    className="px-4 py-2 rounded-xl text-sm bg-zinc-800 hover:bg-zinc-700"
  >
    Manage Subscription
  </button>
)}

    <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-white">Logout</button>
  </>
)}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!user ? (
          <div className="max-w-md mx-auto mt-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Find flights.<br />Book instantly.</h1>
            <p className="text-zinc-400 mb-8">Sign in to start searching</p>
            <button 
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) alert(error.message);
              }} 
              className="bg-white text-black px-8 py-3 rounded-2xl font-semibold"
            >
              Continue with Google
            </button>
          </div>
        ) : currentView === 'search' ? (
          <>
            {/* Journey Type */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => setJourneyType('one_way')} className={`px-6 py-2 rounded-xl ${journeyType === 'one_way' ? 'bg-sky-500' : 'bg-zinc-800'}`}>One way</button>
              <button onClick={() => setJourneyType('return')} className={`px-6 py-2 rounded-xl ${journeyType === 'return' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Return</button>
            </div>

            {/* Search Form */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
              <div className="relative col-span-1">
                <input type="text" value={fromSearch} onChange={(e) => { setFromSearch(e.target.value); fetchSuggestions(e.target.value, setFromSuggestions, setShowFromDropdown); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="From (type city)" />
                {showFromDropdown && fromSuggestions.length > 0 && (
                  <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-50 border border-zinc-700">
                    {fromSuggestions.map((p: any, i: number) => (
                      <div key={i} onClick={() => { setFrom(p.iata_code || p.code); setFromSearch(p.name || p.city_name); setShowFromDropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer text-sm">
                        {p.name} ({p.iata_code || p.code}) — {p.city_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative col-span-1">
                <input type="text" value={toSearch} onChange={(e) => { setToSearch(e.target.value); fetchSuggestions(e.target.value, setToSuggestions, setShowToDropdown); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="To (type city)" />
                {showToDropdown && toSuggestions.length > 0 && (
                  <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-50 border border-zinc-700">
                    {toSuggestions.map((p: any, i: number) => (
                      <div key={i} onClick={() => { setTo(p.iata_code || p.code); setToSearch(p.name || p.city_name); setShowToDropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer text-sm">
                        {p.name} ({p.iata_code || p.code}) — {p.city_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
              {journeyType === 'return' && <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />}
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="p-4 bg-zinc-800 rounded-2xl">
  {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} passengers</option>)}
</select>

<select 
  value={cabinClass} 
  onChange={e => setCabinClass(e.target.value)} 
  className="p-4 bg-zinc-800 rounded-2xl"
>
  <option value="">Any Class</option>
  <option value="economy">Economy</option>
  <option value="premium_economy">Premium Economy</option>
  <option value="business">Business</option>
  <option value="first">First Class</option>
</select>

<button onClick={handleRealSearch} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">SEARCH FLIGHTS</button>
            </div>

            {/* Offers */}
            {offers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Choose your flight</h3>
                <div className="space-y-3">
                  {offers.slice(0, 50).map((offer: any, index: number) => {
  const slice = offer.slices?.[0];
  const segment = slice?.segments?.[0];
  const airline = segment?.marketing_carrier?.name || 'Airline';
  const price = offer.total_amount;

  const cabinName = segment?.passengers?.[0]?.fare_family || 
                    segment?.passengers?.[0]?.cabin_class || 
                    'Economy';

  const stops = slice?.segments?.length > 1 
    ? `${slice.segments.length - 1} stop${slice.segments.length > 2 ? 's' : ''}` 
    : 'Direct';

  // Improved baggage display
  const baggages = segment?.passengers?.[0]?.baggages || [];
  const baggageText = baggages.length > 0 
    ? baggages.map((b: any) => {
        if (b.weight_kg) {
          return `${b.quantity} × ${b.weight_kg}kg ${b.type.replace('_', ' ')}`;
        } else {
          return `${b.quantity} ${b.type.replace('_', ' ')}`;
        }
      }).join(' + ')
    : 'Baggage info not available';

  return (
    <div 
      key={index} 
      onClick={() => setSelectedFlight(offer)} 
      className="bg-zinc-900 border border-zinc-700 hover:border-sky-500 rounded-2xl p-6 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="font-semibold text-lg">{airline}</div>
            <div className="text-xs px-2.5 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
              {cabinName}
            </div>
          </div>

          <div className="text-sm text-zinc-400 mt-1">
            {formatDuration(slice?.duration)} • {stops}
          </div>

          {/* Baggage */}
          <div className="text-xs text-emerald-400 mt-2">
            🧳 {baggageText}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">£{price}</div>
          <div className="text-emerald-400 text-sm mt-1">Click to book →</div>
        </div>
      </div>
    </div>
  );
})}
                </div>
              </div>
            )}
          </>
        ) : (
  // ==================== MY TRIPS VIEW ====================
  <div className="max-w-5xl mx-auto">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold">My Trips</h2>
        <p className="text-zinc-400 mt-1">Your saved flight bookings</p>
      </div>
      <button 
        onClick={() => setCurrentView('search')}
        className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-medium"
      >
        ← Back to Search
      </button>
    </div>

    {loadingTrips ? (
      <div className="text-center py-20 text-zinc-400">Loading your trips...</div>
    ) : trips.length > 0 ? (
      <div className="space-y-4">
        {trips.map((trip, index) => {
  const outbound = trip.slices?.[0];
  const returnSlice = trip.slices?.[1];
  const firstSegment = outbound?.segments?.[0];
  const lastSegment = outbound?.segments?.[outbound?.segments?.length - 1];

  const airlineName = firstSegment?.marketing_carrier?.name || 
                      firstSegment?.operating_carrier?.name || 
                      'Airline';

  const origin = firstSegment?.origin?.iata_code || '—';
  const dest = lastSegment?.destination?.iata_code || '—';
  const stops = outbound?.segments?.length > 1 
    ? `${outbound.segments.length - 1} stop${outbound.segments.length > 2 ? 's' : ''}` 
    : 'Direct';

  const depDate = firstSegment?.departing_at 
    ? new Date(firstSegment.departing_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) 
    : '';

  const returnDate = returnSlice?.segments?.[0]?.departing_at 
    ? new Date(returnSlice.segments[0].departing_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) 
    : '';

  return (
    <div key={index} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6">
      
      {/* Booking Reference + Price */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-mono text-2xl font-bold tracking-[2px]">
            {trip.booking_reference || 'Pending...'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">BOOKING REFERENCE</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">
            {trip.total_currency || '£'} {trip.total_amount}
          </div>
          <div className="text-xs text-zinc-400 capitalize mt-1">
            {trip.status || 'pending'}
          </div>
        </div>
      </div>

      {/* Flight Route Summary */}
      <div className="bg-zinc-950 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tighter">{origin} → {dest}</div>
            <div className="text-xs text-zinc-400 mt-1">
              {stops} • {outbound?.duration}
            </div>
          </div>
          {returnSlice && (
            <div className="text-right">
              <div className="text-sm text-purple-400 font-medium">RETURN</div>
              <div className="text-xs text-zinc-400">{returnDate}</div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-sm">
          <div>
            <span className="text-zinc-400">Outbound</span><br />
            <span className="font-medium">{depDate}</span>
          </div>
          {returnDate && (
            <div className="text-right">
              <span className="text-zinc-400">Return</span><br />
              <span className="font-medium">{returnDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* CHANGE / CANCEL SECTION */}
      <div className="pt-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-400 mb-2">CHANGES & CANCELLATIONS</div>
        
        <div className="bg-zinc-950 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{airlineName}</div>
              <div className="text-sm text-zinc-400">
                Booking ref: <span className="font-mono">{trip.booking_reference || 'Pending'}</span>
              </div>
            </div>

            <button
  onClick={() => {
    console.log("Button clicked, trip:", trip);
    openManageBooking(trip);
  }}
  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium"
>
  Manage Booking →
</button>
          </div>

          <p className="text-[10px] text-zinc-500 mt-3">
            Changes and cancellations are handled directly by the airline according to your fare rules.
          </p>
        </div>
      </div>

    </div>
  );
})}
      </div>
    ) : (
      <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-3xl">
        <p className="text-xl text-zinc-400 mb-2">No trips yet</p>
        <p className="text-sm text-zinc-500">Book a flight and it will appear here automatically.</p>
        <button 
          onClick={() => setCurrentView('search')}
          className="mt-6 px-6 py-3 bg-white text-black rounded-2xl font-semibold text-sm"
        >
          Search flights
        </button>
      </div>
    )}

{/* ====================== SAVED AI IDEAS ====================== */}
  {savedIdeas.length > 0 && (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Saved AI Ideas</h3>
      <div className="space-y-4">
        {savedIdeas.map((idea, index) => (
  <div key={index} className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6">
    <div className="flex justify-between items-start mb-2">
      <div className="font-semibold text-lg">{idea.title}</div>
      <button 
        onClick={async () => {
          if (confirm('Delete this saved idea?')) {
            await supabase.from('saved_ideas').delete().eq('id', idea.id);
            fetchSavedIdeas(); // refresh the list
          }
        }}
        className="text-xs text-red-400 hover:text-red-500 px-2 py-1"
      >
        Delete
      </button>
    </div>

    <div className="text-sm text-zinc-300 whitespace-pre-wrap">
      {idea.content}
    </div>

    <div className="text-xs text-zinc-500 mt-3">
      Saved {new Date(idea.created_at).toLocaleDateString()}
    </div>
  </div>
))}
      </div>
    </div>
  )}

    
  </div>
)}
      </div>

     {/* Flight Details Modal - ENHANCED to show ALL API data + more flight info */}
{selectedFlight && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 rounded-3xl w-full max-w-5xl border border-zinc-700 overflow-hidden flex flex-col max-h-[92vh]">
      
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-zinc-800 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Flight Details</h2>
          <p className="text-zinc-400 text-sm mt-1">Review before booking on Duffel • All data from API</p>
        </div>
        <button 
          onClick={() => setSelectedFlight(null)} 
          className="text-zinc-400 hover:text-white text-3xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-8 overflow-y-auto flex-1">
        
        {/* Outbound + Return side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Outbound */}
          {selectedFlight.slices?.[0] && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">OUTBOUND</div>
                <div className="text-xs text-zinc-500">{formatDuration(selectedFlight.slices[0].duration)}</div>
              </div>
              
              {selectedFlight.slices[0].segments?.map((segment: any, idx: number) => (
                <div key={idx} className="bg-zinc-950 rounded-2xl p-5 mb-3 border border-zinc-800">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold tracking-tighter">{segment.origin.iata_code}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{segment.origin.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tighter">{segment.destination.iata_code}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{segment.destination.name}</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <div className="text-[10px] text-emerald-400/70 font-medium tracking-widest">DEPARTURE</div>
                      <div className="font-semibold text-lg leading-none mt-1">
                        {new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {new Date(segment.departing_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400/70 font-medium tracking-widest">ARRIVAL</div>
                      <div className="font-semibold text-lg leading-none mt-1">
                        {new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {new Date(segment.arriving_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                    <div>{segment.marketing_carrier?.name}</div>
                    <div>{formatDuration(segment.duration)} • {segment.stops?.length || 0} stop{segment.stops?.length !== 1 ? 's' : ''}</div>
                  </div>

                  
                  
                  {/* Extra flight info from API if available */}
                  <div className="pt-2 text-[10px] text-zinc-500 space-y-0.5">
                    {segment.marketing_carrier_flight_number && <div>Flight #{segment.marketing_carrier_flight_number}</div>}
                    {segment.operating_carrier && segment.operating_carrier.name !== segment.marketing_carrier?.name && (
                      <div>Operated by {segment.operating_carrier.name}</div>
                    )}
                    {segment.aircraft && (
                      <div>Aircraft: {segment.aircraft.name || segment.aircraft}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Return */}
          {selectedFlight.slices?.[1] && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">RETURN</div>
                <div className="text-xs text-zinc-500">{formatDuration(selectedFlight.slices[1].duration)}</div>
              </div>
              
              {selectedFlight.slices[1].segments?.map((segment: any, idx: number) => (
                <div key={idx} className="bg-zinc-950 rounded-2xl p-5 mb-3 border border-zinc-800">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold tracking-tighter">{segment.origin.iata_code}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{segment.origin.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tighter">{segment.destination.iata_code}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{segment.destination.name}</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <div className="text-[10px] text-emerald-400/70 font-medium tracking-widest">DEPARTURE</div>
                      <div className="font-semibold text-lg leading-none mt-1">
                        {new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {new Date(segment.departing_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400/70 font-medium tracking-widest">ARRIVAL</div>
                      <div className="font-semibold text-lg leading-none mt-1">
                        {new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {new Date(segment.arriving_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                    <div>{segment.marketing_carrier?.name}</div>
                    <div>{formatDuration(segment.duration)} • {segment.stops?.length || 0} stop{segment.stops?.length !== 1 ? 's' : ''}</div>
                  </div>

                  {/* Extra flight info from API if available */}
                  <div className="pt-2 text-[10px] text-zinc-500 space-y-0.5">
                    {segment.marketing_carrier_flight_number && <div>Flight #{segment.marketing_carrier_flight_number}</div>}
                    {segment.operating_carrier && segment.operating_carrier.name !== segment.marketing_carrier?.name && (
                      <div>Operated by {segment.operating_carrier.name}</div>
                    )}
                    {segment.aircraft && (
                      <div>Aircraft: {segment.aircraft.name || segment.aircraft}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Price - full width under the flights */}
        <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
          <div>
            <div className="text-sm text-zinc-400">Total price for all passengers</div>
            <div className="text-xs text-zinc-500 mt-0.5">Includes taxes & fees • Book securely on Duffel</div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-emerald-400 tracking-tighter">£{selectedFlight.total_amount}</div>
          </div>
        </div>
                               {/* ====================== UPDATED: Flight Class, Baggage, Amenities + Booking Info (all in one card) ====================== */}
        <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">✈️ Flight Class, Baggage & Amenities</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            
            {/* Fare Class */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">FARE CLASS</div>
              <div className="font-semibold text-lg">
                {selectedFlight.slices?.[0]?.fare_brand_name || 'Basic'}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {selectedFlight.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class_marketing_name || 'Economy'}
              </div>
            </div>

            {/* Baggage */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">BAGGAGE ALLOWANCE (per passenger)</div>
              <div className="font-semibold text-emerald-400">
                {getBaggageSummary(selectedFlight)}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">✓ Pulled live from Duffel API</div>
            </div>

            {/* WiFi */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">WIFI</div>
              <div className="font-medium">
                {(() => {
                  const w = selectedFlight.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin?.amenities?.wifi;
                  if (w && w.available) {
                    return w.cost === 'paid' ? 'Available (Paid)' : 'Available (Free)';
                  }
                  return 'Available on this aircraft';
                })()}
              </div>
            </div>

            {/* Power */}
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">POWER OUTLETS / USB</div>
              <div className="font-medium">
                {(() => {
                  const p = selectedFlight.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin?.amenities?.power;
                  return p && p.available ? 'Available at every seat' : 'Available on this aircraft';
                })()}
              </div>
            </div>

          </div>

          {/* Distance */}
          <div className="mt-4 pt-4 border-t border-zinc-800 text-sm">
            <span className="text-xs text-zinc-400">FLIGHT DISTANCE</span><br />
            <span className="font-semibold text-lg">
              {selectedFlight.slices?.[0]?.segments?.[0]?.distance 
                ? `${parseFloat(selectedFlight.slices[0].segments[0].distance).toFixed(0)} km` 
                : 'See exact distance in raw API data below'}
            </span>
          </div>

          {/* NEW: The 5 items you wanted — now inside the same card */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="text-xs text-zinc-400 mb-3">IMPORTANT BOOKING INFO</div>
            
            <div className="space-y-3 text-sm">
              
              {/* CO₂ Emissions */}
              {selectedFlight.total_emissions_kg && (
                <div className="flex justify-between items-center bg-zinc-900 rounded-xl px-4 py-2.5">
                  <div className="text-zinc-400">Estimated CO₂ emissions</div>
                  <div className="font-semibold text-emerald-400">{selectedFlight.total_emissions_kg} kg</div>
                </div>
              )}

              {/* Refund Policy */}
              {selectedFlight.conditions?.refund_before_departure && (
                <div className="flex justify-between items-center bg-zinc-900 rounded-xl px-4 py-2.5">
                  <div className="text-zinc-400">Cancellation</div>
                  <div className="font-semibold text-right text-sm">
                    {selectedFlight.conditions.refund_before_departure.allowed 
                      ? `Free cancellation${selectedFlight.conditions.refund_before_departure.penalty_amount ? ` with £${selectedFlight.conditions.refund_before_departure.penalty_amount} fee` : ''}` 
                      : 'Not allowed'}
                  </div>
                </div>
              )}

              {/* Change Policy */}
              {selectedFlight.conditions?.change_before_departure && (
                <div className="flex justify-between items-center bg-zinc-900 rounded-xl px-4 py-2.5">
                  <div className="text-zinc-400">Changes</div>
                  <div className="font-semibold">
                    {selectedFlight.conditions.change_before_departure.allowed ? 'Allowed' : 'Not allowed on this fare'}
                  </div>
                </div>
              )}

              {/* Offer Expiry */}
              {selectedFlight.expires_at && (
                <div className="flex justify-between items-center bg-zinc-900 rounded-xl px-4 py-2.5">
                  <div className="text-zinc-400">This price expires</div>
                  <div className="font-semibold text-amber-400 text-sm">
                    {new Date(selectedFlight.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    ({Math.max(0, Math.floor((new Date(selectedFlight.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)))} hrs left)
                  </div>
                </div>
              )}

              {/* Price Guarantee */}
              {selectedFlight.payment_requirements?.price_guarantee_expires_at && (
                <div className="flex justify-between items-center bg-zinc-900 rounded-xl px-4 py-2.5">
                  <div className="text-zinc-400">Price guarantee until</div>
                  <div className="font-semibold text-xs">
                    {new Date(selectedFlight.payment_requirements.price_guarantee_expires_at).toLocaleString([], { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
        
        {/* 
  ====================== RAW API DATA SECTION (Hidden for now) ======================
  <div className="mt-6">
    <details className="group bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
      <summary className="cursor-pointer px-6 py-4 font-semibold flex items-center justify-between hover:bg-zinc-900 transition-colors list-none">
        <div className="flex items-center gap-3">
          <span>Show ALL raw API data from Duffel</span>
        </div>
      </summary>
      <div className="border-t border-zinc-800 p-6 bg-black">
        ... raw data ...
      </div>
    </details>
  </div>
*/}

      </div>

      {/* Footer Buttons */}
      <div className="px-8 py-6 bg-zinc-950 border-t border-zinc-800 flex gap-4 flex-shrink-0">
        <button 
          onClick={() => setSelectedFlight(null)} 
          className="flex-1 py-4 rounded-2xl border border-zinc-700 hover:bg-zinc-800 font-medium transition active:scale-[0.985]"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            createDuffelLink(selectedFlight.id);
            setSelectedFlight(null);
          }} 
          className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-2xl font-bold text-lg transition active:scale-[0.985]"
        >
          Book on Duffel →
        </button>
      </div>

    </div>
  </div>
)}

{/* AI Trip Ideas Modal */}
{showIdeasModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
      
            <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold">AI Trip Ideas</h3>
        <button
          onClick={() => {
            setShowIdeasModal(false);
            setIdeaDestination('');
            setIdeaResults('');
          }}
          className="text-2xl text-zinc-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
       <div className="text-sm text-zinc-400 mb-3">
    {remainingIdeas} / 20 searches remaining this month
  </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={ideaDestination}
            onChange={(e) => setIdeaDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getTripIdeas()}
            placeholder="Where do you want to go? (e.g. Barcelona, quiet beach in Greece)"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none"
          />
          <button 
            onClick={getTripIdeas}
            disabled={isIdeasLoading || !ideaDestination.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 px-6 rounded-2xl font-medium"
          >
            {isIdeasLoading ? 'Thinking...' : 'Get Ideas'}
          </button>
        </div>

        {ideaResults && (
  <div>
    <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-5 whitespace-pre-wrap text-sm leading-relaxed mb-4">
      {ideaResults}
    </div>

    {userIsPro ? (
  <button onClick={saveIdea} className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-2xl font-medium">
    Save Idea
  </button>
) : (
  <button
  onClick={() => setShowUpgradeModal(true)}
  className="w-full bg-amber-500 hover:bg-amber-600 py-3 rounded-2xl font-medium text-black"
>
  Upgrade to Pro (£2.99/mo)
</button>
)}
  </div>
)}
      </div>

    </div>
  </div>
)}

         {/* ====================== UPGRADE TO PRO MODAL ====================== */}
{showUpgradeModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md">
      <div className="px-6 py-5 text-center border-b border-zinc-700">
        <h3 className="text-2xl font-semibold">Upgrade to Pro</h3>
        <p className="text-zinc-400 mt-1">£2.99/month • Cancel anytime</p>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <div className="font-medium mb-2">What you get:</div>
          <ul className="text-sm space-y-2">
            <li className="flex gap-2">✅ AI Trip Ideas (20/month)</li>
            <li className="flex gap-2">✅ AI Booking Helper (changes, cancellations, bags)</li>
            <li className="flex gap-2">✅ Save & organise all your ideas</li>
            <li className="flex gap-2">✅ Future features (price alerts, smart planning)</li>
          </ul>
        </div>

                        <button 
          onClick={async () => {
            console.log("🚀 Subscribe clicked - user:", user);
            if (!user?.id) {
              alert("Please log in with Google first");
              return;
            }
            try {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
              });

              const data = await res.json();
              console.log("📡 API response:", data);

              if (data.error) {
                alert("Stripe error: " + data.error);
                console.error(data.error);
              } else if (data.url) {
                alert("✅ Redirecting to Stripe... (check console)");
                window.location.href = data.url;
              } else {
                alert("No URL returned from server");
              }
            } catch (err: any) {
              console.error("❌ Fetch error:", err);
              alert("Failed to contact Stripe: " + err.message + "\n\nCheck Vercel logs + make sure env vars are added");
            }
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 py-4 rounded-2xl font-semibold text-lg"
        >
          Subscribe £2.99/month with Stripe 🔄
        </button>

        <button 
          onClick={() => setShowUpgradeModal(false)}
          className="w-full py-3 text-zinc-400 hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  </div>
)}
          
          {/* ====================== MANAGE BOOKING MODAL (with AI) ====================== */}
{showManageModal && selectedTripForManage && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Manage Booking</h3>
          <p className="text-sm text-zinc-400">{selectedTripForManage.booking_reference || 'Pending...'}</p>
        </div>
        <button 
          onClick={() => setShowManageModal(false)} 
          className="text-2xl text-zinc-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: Flight Info + Generic Help */}
<div className="w-2/5 border-r border-zinc-700 p-6 overflow-y-auto">
  <h4 className="font-semibold mb-4">Flight Summary</h4>
  
  <div className="space-y-4 text-sm">
    <div>
      <div className="text-zinc-400 text-xs">AIRLINE</div>
      <div className="font-medium">
        {selectedTripForManage.slices?.[0]?.segments?.[0]?.marketing_carrier?.name || 'Airline'}
      </div>
    </div>

    <div>
      <div className="text-zinc-400 text-xs">ROUTE</div>
      <div className="font-medium">
        {selectedTripForManage.slices?.[0]?.segments?.[0]?.origin?.iata_code || '—'} → {selectedTripForManage.slices?.[0]?.segments?.[0]?.destination?.iata_code || '—'}
      </div>
    </div>
  </div>

  {/* Generic Help Text for everyone (especially free users) */}
  <div className="mt-8 pt-6 border-t border-zinc-700">
    <h5 className="font-semibold mb-3 text-sm">How to manage your booking</h5>
    <div className="text-sm text-zinc-400 space-y-3">
      <p>
        To cancel, change dates, add bags, or make any changes to your booking, 
        you need to contact the airline directly.
      </p>
      <p>
        Use the <strong>booking reference</strong> shown above and go to the airline’s website or app. 
        Most airlines let you manage your booking online.
      </p>
      <p className="text-xs text-zinc-500">
        Note: Some changes may have fees depending on the airline’s rules and how close you are to departure.
      </p>
    </div>
  </div>
</div>

        {/* RIGHT: AI Chat Area (Pro only) */}
<div className="flex-1 flex flex-col p-6">
  <h4 className="font-semibold mb-3">Ai-Assists • Help & Guidance</h4>

{/* Remaining messages counter */}
{userIsPro && (
  <div className="text-xs text-zinc-400 mb-2">
    {remainingBookingMessages} / 100 AI Booking messages left this month
  </div>
)}
 
  {userIsPro ? (
    <>
     
     {/* Pro users see the real AI chat */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "How do I cancel my flight?",
          "Can I change my travel dates?",
          "How do I add extra bags?",
          "I need to change a passenger name"
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendMessageToAI(prompt)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full border border-zinc-700"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl p-4 mb-4 overflow-y-auto text-sm space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-zinc-400">
            Hi! Ask me anything about managing this booking.
          </div>
        )}
        {chatMessages.map((msg, index) => (
          <div key={index} className={msg.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-zinc-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isAiLoading && (
          <div className="text-zinc-400">Ai-Assists is thinking...</div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessageToAI(chatInput)}
          placeholder="Ask about changes, cancellations, bags..." 
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none"
        />
        <button 
          onClick={() => sendMessageToAI(chatInput)}
          disabled={isAiLoading || !chatInput.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 px-6 rounded-2xl font-medium"
        >
          Send
        </button>
      </div>
    </>
  ) : (
    /* Free users see upgrade prompt */
    <div className="flex-1 flex flex-col items-center justify-center text-center border border-zinc-700 rounded-2xl p-8">
      <div className="text-4xl mb-4">🔒</div>
      <h4 className="font-semibold text-lg mb-2">AI Booking Helper is a Pro feature</h4>
      <p className="text-zinc-400 mb-6 max-w-xs">
        Upgrade to Pro to get AI help with cancellations, date changes, bags, and more.
      </p>
      <button
        onClick={() => {
          setShowManageModal(false);
          setShowUpgradeModal(true);
        }}
        className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-2xl font-medium"
      >
        Upgrade to Pro (£2.99/mo)
      </button>
    </div>
  )}
</div>
        </div>

      </div>
    </div>
)}
    </div>
  );
}
