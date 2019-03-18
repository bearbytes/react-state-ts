import React from 'react'
import { useQuery } from '../store'
import { AppState } from '../types'

const Selectors = {
  horseNames: (s: AppState) => s.horses.map((it) => it.name),
}

export default function RaceTracks() {
  const horseNames = useQuery(Selectors.horseNames)

  return (
    <div>
      {horseNames.map((name, index) => (
        <RaceTrack key={index} horseName={name} />
      ))}
    </div>
  )
}

function RaceTrack(props: { horseName: string }) {
  const progress = useQuery((s) => s.progress[props.horseName])
  return (
    <div>
      {props.horseName}: {Math.round(progress * 100)}
    </div>
  )
}
