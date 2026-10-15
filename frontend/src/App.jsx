import { useState } from 'react'
import { OnboardingWelcome } from '@/components/onboarding/onboarding-welcome'
import { LoginScreen, RegisterScreen } from '@/components/auth/auth-screen'
import DemostackDashboardDemo from '@/components/dashboards/demostack-dashboard/demo'

function App() {
  const [screen, setScreen] = useState('onboarding')

  if (screen === 'onboarding') {
    return <OnboardingWelcome onGetStarted={() => setScreen('login')} />
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onSubmit={(data) => {
          console.log('Login:', data)
          setScreen('app')
        }}
        onForgotPassword={() => console.log('Forgot password')}
        onSwitchToRegister={() => setScreen('register')}
        onSocialLogin={(provider) => console.log('Social login:', provider)}
      />
    )
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onSubmit={(data) => {
          console.log('Register:', data)
          setScreen('app')
        }}
        onSwitchToLogin={() => setScreen('login')}
        onSocialLogin={(provider) => console.log('Social login:', provider)}
      />
    )
  }

  return <DemostackDashboardDemo />
}

export default App
