import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'

function App() {
  return (
    <div className="relative min-h-screen bg-ink text-amber">
      <header className="sticky top-0 z-40 border-b-2 border-amber/40 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-shell items-center justify-between px-5 py-3 sm:px-8">
          <a href="#top" className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <path
                d="M9 5 L3 12 L9 19"
                fill="none"
                stroke="#FF8200"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <path
                d="M15 5 L21 12 L15 19"
                fill="none"
                stroke="#FF8200"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <path
                d="M15 4 L9 20"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.5"
                strokeLinecap="square"
              />
            </svg>
            <span className="font-display text-[2.2rem] uppercase leading-none tracking-[0.1em]">OpenFlip</span>
          </a>
          <a href="#top" className="btn !py-2 !px-3 !text-[1.3rem]">Join Waitlist</a>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-shell px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Hero />
        <div className="mt-20">
          <Features />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
