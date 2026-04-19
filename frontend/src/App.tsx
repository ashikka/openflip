import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'

function App() {
  return (
    <div className="relative min-h-screen bg-ink text-amber">
      <header className="sticky top-0 z-40 border-b border-amber/30 bg-ink/95 backdrop-blur sm:border-b-2 sm:border-amber/40">
        <div className="mx-auto flex w-full max-w-shell items-center justify-between px-4 py-2.5 sm:px-8 sm:py-3">
          <a href="#top" className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo.png"
              alt="OpenFlip"
              className="h-7 w-auto sm:h-9"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="font-display text-[1.5rem] leading-none tracking-[-0.01em] sm:text-[1.85rem]">OpenFlip</span>
          </a>
          <a href="#top" className="btn !py-1.5 !px-2.5 !text-[1.1rem] sm:!py-2 sm:!px-3 sm:!text-[1.3rem]">Join</a>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-shell px-4 pb-12 pt-6 sm:px-8 sm:pt-12 sm:pb-16">
        <Hero />
        <div className="mt-12 sm:mt-20">
          <Features />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
