export default function BookingFailed() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
        <p className="text-zinc-400 mb-8">
          Unfortunately your payment did not go through.  
          Please try again or contact support if the issue continues.
        </p>

        <div className="flex flex-col gap-3">
          <a 
            href="/" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-semibold"
          >
            Try Booking Again
          </a>
          <a 
            href="/trips" 
            className="border border-zinc-700 hover:bg-zinc-900 py-3 rounded-2xl font-medium"
          >
            Go to My Trips
          </a>
        </div>
      </div>
    </div>
  );
}
