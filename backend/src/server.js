import 'dotenv/config'
import app from './app.js'
import { ReminderService } from './services/ReminderService.js'

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`)
})

const reminder = new ReminderService()
if (process.env.REMINDER_ENABLED !== 'false') reminder.start()

process.on('SIGTERM', () => {
  reminder.stop()
  server.close(() => process.exit(0))
})
