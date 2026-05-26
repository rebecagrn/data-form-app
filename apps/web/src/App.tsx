import { ClientRegistrationForm } from '@/components/client-registration-form'

function App() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_264/0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,oklch(0.99_0.01_264/0.5))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(oklch(0.5_0.02_264/0.12)_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10 sm:px-6">
        <ClientRegistrationForm />
      </main>

      <footer className="text-muted-foreground pb-6 text-center text-xs">
        Data Form App — desafio técnico
      </footer>
    </div>
  )
}

export default App
