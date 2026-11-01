import { MdMarkEmailRead } from 'react-icons/md'
import { Screen } from '@/components/pelajar/Screen'
import { useToast } from '@/components/pelajar/Toast'
import { Button } from '@/components/pelajar/Button'
import { useRouter } from '@/lib/router'

// UC1-L06 Cek Email
export function CekEmailPage() {
  const { navigate, query } = useRouter()
  const toast = useToast()
  return (
    <Screen kode="UC1-L06" back="/masuk">
      <div className="flex min-h-[75vh] flex-col items-center justify-center text-center">
        <div className="flex size-28 items-center justify-center rounded-full bg-violet-100 text-[#5F33E1]">
          <MdMarkEmailRead className="size-16" />
        </div>
        <h1 className="mt-8 text-3xl font-bold text-[#24252C] font-['Poppins']">Cek Email Anda</h1>
        <p className="mt-3 text-[#6E6A7C]">
          Tautan atur ulang kata sandi sudah dikirim ke <strong>{query.email}</strong>.
        </p>
        {/* Simulasi membuka tautan dari email */}
        <Button className="mt-10 w-full" onClick={() => navigate(`/atur-ulang?email=${encodeURIComponent(query.email ?? '')}`)}>
          Buka Email
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => toast('Tautan dikirim ulang.')}>
          Kirim Ulang
        </Button>
      </div>
    </Screen>
  )
}
