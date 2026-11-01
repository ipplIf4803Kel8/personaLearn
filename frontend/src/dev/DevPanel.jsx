import { useState } from 'react'
import { useDb } from '@/data/db'
import { useRouter } from '@/lib/router'

/**
 * Panel kecil khusus mode pengembangan (npm run dev) untuk pengujian:
 * simulasi koneksi gagal, reset data contoh, dan pintasan ke halaman admin.
 */
export function DevPanel() {
  const { db, aksi } = useDb()
  const { navigate } = useRouter()
  const [buka, setBuka] = useState(false)
  return (
    <div className="fixed right-3 bottom-24 z-[90] text-xs">
      {buka && (
        <div className="mb-2 w-56 space-y-2 rounded-xl border bg-white p-3 shadow-lg">
          <p className="font-semibold">Mode Uji</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={db.simulasi.koneksi} onChange={(e) => aksi.setSimulasiKoneksi(e.target.checked)} />
            Simulasikan koneksi gagal
          </label>
          <button
            type="button"
            className="w-full rounded-lg border px-2 py-1"
            onClick={() => {
              aksi.resetData()
              navigate('/', { replace: true })
            }}
          >
            Reset data demo
          </button>
          <button type="button" className="w-full rounded-lg border px-2 py-1" onClick={() => navigate('/admin/masuk')}>
            Buka halaman Admin
          </button>
        </div>
      )}
      <button type="button" onClick={() => setBuka((v) => !v)} className="rounded-full bg-gray-900 px-3 py-2 font-semibold text-white shadow-lg">
        {buka ? 'Tutup' : 'Uji'}
      </button>
    </div>
  )
}
