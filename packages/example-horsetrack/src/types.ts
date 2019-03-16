export interface State {
  horses: RacingHorse[]
  progress: { [horseName: string]: number }
  isRunning: boolean
}

export interface RacingHorse {
  name: string
  color: string
}
