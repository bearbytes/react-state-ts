import { addCommands } from './store'
import { RacingHorse } from './types'

export const { useCommand } = addCommands({
  start: (s) => {
    s.isRunning = true
  },
  stop: (s) => {
    s.isRunning = false
  },
  moveForward: (s, data: { horseName: string; moveBy: number }) => {
    s.progress[data.horseName] += data.moveBy
  },
  addHorse: (s, data: { horse: RacingHorse }) => {
    s.horses.push(data.horse)
    s.progress[data.horse.name] = 0
  },
})
