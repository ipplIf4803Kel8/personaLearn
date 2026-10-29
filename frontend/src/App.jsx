import { useState } from 'react'
import { OnboardingWelcome } from '@/components/onboarding/onboarding-welcome'
import { LoginScreen, RegisterScreen } from '@/components/auth/auth-screen'
import DemostackDashboardDemo from '@/components/dashboards/demostack-dashboard/demo'
import { AuthProvider, useAuth } from '@/context/AuthContext'

function Screens() {
  const { user, loading, login, register, logout } = useAuth()
  const [screen, setScreen] = useState('onboarding')

  if (loading) return null

  if (user?.role === 'admin') return <DemostackDashboardDemo />

  // ponytail: aplikasi pelajar belum dibuat, sementara tampilkan sapaan + keluar
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold">Hai, {user.name}</p>
        <button type="button" onClick={logout} className="font-semibold text-[#5F33E1]">
          Keluar
        </button>
      </div>
    )
  }

  if (screen === 'onboarding') {
    return <OnboardingWelcome onGetStarted={() => setScreen('login')} />
  }

  if (screen === 'register') {
    return <RegisterScreen onSubmit={register} onSwitchToLogin={() => setScreen('login')} />
  }

  return (
    <LoginScreen
      onSubmit={login}
      onForgotPassword={() => {}}
      onSwitchToRegister={() => setScreen('register')}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Screens />
    </AuthProvider>
  )
}
