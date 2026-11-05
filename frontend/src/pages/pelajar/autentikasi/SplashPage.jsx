import { OnboardingWelcome } from '@/components/onboarding/onboarding-welcome'
import { useRouter } from '@/lib/router'

// UC1-L01 Splash
export function SplashPage() {
  const { navigate } = useRouter()
  return (
    <div data-screen="UC1-L01">
      <OnboardingWelcome onGetStarted={() => navigate('/masuk')} />
    </div>
  )
}
