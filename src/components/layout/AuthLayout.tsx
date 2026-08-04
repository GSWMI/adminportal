interface Props {
  children: React.ReactNode
}

/**
 * Shared chrome for all public, full-screen auth pages
 * (login, set/forgot/reset password): navy header with the GSWMI logo,
 * a white centered content column, and the gray footer.
 */
export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#0d1b2a] py-4 px-6 flex items-center justify-center">
        <img src="/logo.png" alt="GSWMI" className="h-10 object-contain" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-85">{children}</div>
      </main>

      <footer className="bg-gray-100 py-3 text-center text-[13px] text-gray-500">
        © GSWMI Logistics Team
      </footer>
    </div>
  )
}
