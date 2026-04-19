import ActivityTicker from './components/ActivityTicker'
import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ModuleRegistry from './components/ModuleRegistry'

function App() {
  return (
    <div className="relative min-h-screen bg-ink text-amber">
      <header className="sticky top-0 z-40 border-b-2 border-amber/40 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-shell items-center justify-between px-5 py-3 sm:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center border-2 border-amber bg-amber text-ink font-display text-[1.4rem] leading-none">◆</span>
            <span className="font-display text-[2.2rem] uppercase leading-none tracking-[0.1em]">OpenFlip</span>
          </a>
          <a href="#top" className="btn !py-2 !px-3 !text-[1.3rem]">Join Waitlist</a>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-shell px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Hero />
        <div className="mt-16">
          <Features />
        </div>
        <div className="mt-16">
          <ModuleRegistry />
        </div>
      </main>

      <ActivityTicker />
      <Footer />
    </div>
  )
}

export default App
