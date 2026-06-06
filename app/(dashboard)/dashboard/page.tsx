export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Coming soon</p>
          </div>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-dim)]"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
