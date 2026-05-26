import { ClientRegistrationForm } from '@/components/client-registration-form'
import { ThemeToggle } from '@/components/theme-toggle'

function App() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,var(--page-glow),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,var(--page-fade))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(var(--page-grid)_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden
      />

      <main className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>
        <ClientRegistrationForm />
      </main>

      <footer className="text-muted-foreground pb-6 text-center text-xs">
        Data Form App — desafio técnico
      </footer>
    </div>
  )
}

export default App
