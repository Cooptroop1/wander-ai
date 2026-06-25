21:31:38.445 Running build in Washington, D.C., USA (East) – iad1
21:31:38.445 Build machine configuration: 2 cores, 8 GB
21:31:38.553 Cloning github.com/Cooptroop1/wander-ai (Branch: main, Commit: 2821544)
21:31:38.844 Cloning completed: 290.000ms
21:31:40.023 Restored build cache from previous deployment (3ajgdFmbQeYENZjhno4YJrouZtos)
21:31:40.352 Running "vercel build"
21:31:40.372 Vercel CLI 54.17.2
21:31:40.706 Installing dependencies...
21:31:46.666 
21:31:46.667 up to date in 6s
21:31:46.668 
21:31:46.668 154 packages are looking for funding
21:31:46.668   run `npm fund` for details
21:31:46.699 Detected Next.js version: 16.2.9
21:31:46.706 Running "npm run build"
21:31:46.806 
21:31:46.806 > build
21:31:46.807 > next build
21:31:46.807 
21:31:47.511   Applying modifyConfig from Vercel
21:31:47.528 ▲ Next.js 16.2.9 (Turbopack)
21:31:47.529 - Cache Components enabled
21:31:47.529 
21:31:47.574   Creating an optimized production build ...
21:31:59.119 ✓ Compiled successfully in 11.2s
21:31:59.129   Running TypeScript ...
21:32:04.291 Failed to type check.
21:32:04.292 
21:32:04.292 ./app/page.tsx:67:66
21:32:04.293 Type error: Type '"M"' is not assignable to type 'DuffelPassengerGender'. Did you mean '"m"'?
21:32:04.293 
21:32:04.293   65 | ...["bags", "seats", "cancel_for_any_reason"]}
21:32:04.293   66 | ...={[
21:32:04.293 > 67 | ...', given_name: "John", family_name: "Doe", gender: "M", title: "mr", born_on: "1990-01-...
21:32:04.294      |                                               ^
21:32:04.294   68 | ...
21:32:04.294   69 | ...eady={(payload) => console.log("Payload ready for booking:", payload)}
21:32:04.294   70 | ...
21:32:04.327 Next.js build worker exited with code: 1 and signal: null
21:32:04.376 Error: Command "npm run build" exited with 1
