import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import stopwatch from '@/assets/onboarding/stopwatch.png'
import calendar from '@/assets/onboarding/calendar.png'
import piechart from '@/assets/onboarding/piechart.png'
import vase from '@/assets/onboarding/vase.png'
import notifications from '@/assets/onboarding/notifications.png'
import person from '@/assets/onboarding/person.png'

const spring = { type: 'spring', stiffness: 300, damping: 30 }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { ...spring, delay },
})

const float = (duration, delay = 0, distance = 8) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration, repeat: Infinity, ease: 'easeInOut', delay },
})

// position/size as % of the 375x270 illustration stage, read off the Figma frame
const icons = [
  { src: stopwatch, style: { left: '26%', top: '1%', width: '13%' }, float: float(3.4, 0) },
  { src: calendar, style: { left: '73%', top: '27%', width: '10%' }, float: float(3.8, 0.3) },
  { src: piechart, style: { left: '22%', top: '43%', width: '7.5%' }, float: float(3.2, 0.6) },
  { src: notifications, style: { left: '66%', top: '59%', width: '16.5%' }, float: float(4, 0.2) },
  { src: vase, style: { left: '17%', top: '77%', width: '10%' }, float: float(3.6, 0.5) },
]

const smallDots = [
  { color: '#BE9FFF', size: 4, style: { left: '54%', top: '33%' }, delay: 0 },
  { color: '#92DEFF', size: 8, style: { left: '68%', top: '27%' }, delay: 0.4 },
]

const scatterDots = [
  { color: '#FFD7E4', size: 8, style: { left: '38%', top: '30%' }, delay: 0 },
  { color: '#A4E7F9', size: 4, style: { left: '49%', top: '43%' }, delay: 0.3 },
  { color: '#EAED2A', size: 8, style: { left: '69%', top: '22%' }, delay: 0.6 },
  { color: '#7FFCAA', size: 4, style: { left: '77%', top: '0%' }, delay: 0.9 },
]

export function OnboardingWelcome({
  appName = 'E-Learning',
  description = 'Platform belajar fleksibel untuk mendukung pembelajaran Anda kapan saja, di mana saja.',
  buttonText = 'Yuk Belajar',
  onGetStarted,
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-10 -left-16 h-56 w-56 rounded-full bg-green-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-violet-200/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 -left-10 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col px-6 pt-10 pb-8 md:max-w-4xl md:flex-row md:items-center md:gap-12 md:px-12">
        {/* illustration stage, centered in the space above the copy on mobile */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            className="relative mx-auto aspect-[375/270] w-full max-w-[420px] shrink-0 md:max-w-[460px]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
          >
            {smallDots.map((dot, i) => (
              <motion.span
                key={`sd-${i}`}
                className="absolute rounded-full"
                style={{ ...dot.style, width: dot.size, height: dot.size, backgroundColor: dot.color }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: dot.delay }}
              />
            ))}

            <motion.img
              src={person}
              alt=""
              className="absolute"
              style={{ left: '35%', top: '30%', width: '42%' }}
              draggable={false}
              {...float(4.2, 0.1, 6)}
            />

            {icons.map((icon, i) => (
              <motion.img
                key={i}
                src={icon.src}
                alt=""
                className="absolute"
                style={icon.style}
                draggable={false}
                {...icon.float}
              />
            ))}
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-1 md:pt-10">
          {/* decorative dots between illustration and copy */}
          <div className="relative h-16">
            {scatterDots.map((dot, i) => (
              <motion.span
                key={`scatter-${i}`}
                className="absolute rounded-full"
                style={{ ...dot.style, width: dot.size, height: dot.size, backgroundColor: dot.color }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: dot.delay }}
              />
            ))}
          </div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-center text-4xl font-extrabold tracking-tight text-[#24252C] md:text-left md:text-5xl"
          >
            {appName}
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-4 text-center text-lg leading-relaxed text-[#6E6A7C] md:text-left"
          >
            Selamat datang di <strong className="font-semibold">{appName}</strong>!{' '}
            {description}
          </motion.p>

          <motion.button
            {...fadeUp(0.3)}
            type="button"
            onClick={onGetStarted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#5F33E1] px-8 py-5 text-lg font-bold text-white shadow-lg shadow-violet-300/50 md:mt-10 md:w-fit md:px-10"
          >
            {buttonText}
            <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWelcome
