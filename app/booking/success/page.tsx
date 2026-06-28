export default function BookingSuccess() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-zinc-400 mb-8">
          Thank you for booking with Ai-Assists.  
          You will receive a confirmation email shortly with your booking reference.
        </p>

        <div className="flex flex-col gap-3">
          <a 
            href="/trips" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-semibold"
          >
            Go to My Trips
          </a>
          <a 
            href="/" 
            className="border border-zinc-700 hover:bg-zinc-900 py-3 rounded-2xl font-medium"
          >
            Back to Search
          </a>
        </div>
      </div>
    </div>
  );
}
