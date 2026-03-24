'use client';

export default function WorldMap() {
  return (
    <div 
      className="h-[600px] bg-zinc-900 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-3xl text-center p-8"
      onClick={() => alert("🌍 Clicked! Next step we'll make this a real interactive world map")}
    >
      <div>
        <div className="text-8xl mb-4">🌍</div>
        <h2 className="text-3xl font-bold text-white mb-2">World Map</h2>
        <p className="text-zinc-400 max-w-xs mx-auto">
          Click anywhere on the real map (coming in 1 minute) to see flights, hotels, and AI trip plans
        </p>
        <p className="text-xs text-emerald-400 mt-8">✅ App is now building successfully!</p>
      </div>
    </div>
  );
}
