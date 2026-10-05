import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState({ loading: true })

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus({ loading: false, data }))
      .catch(() => setStatus({ loading: false, error: true }))
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-indigo-600">personaLearn</h1>
        <p className="mt-2 text-slate-600">
          Platform e-learning dengan rekomendasi konten pembelajaran.
        </p>

        <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm">
          <p className="font-semibold text-slate-700">Status sistem</p>
          {status.loading && <p className="text-slate-500">Memeriksa...</p>}
          {status.error && <p className="text-red-600">Backend tidak terhubung</p>}
          {status.data && (
            <ul className="mt-1 space-y-1 text-slate-600">
              <li>Backend: <span className="text-green-600">{status.data.status}</span></li>
              <li>
                Database:{' '}
                <span className={status.data.database === 'connected' ? 'text-green-600' : 'text-red-600'}>
                  {status.data.database}
                </span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
