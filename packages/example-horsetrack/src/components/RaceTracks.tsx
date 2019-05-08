import React from 'react'
import { useSelection } from '../Store'
import { selectHorseNames } from '../Selectors'

export default function RaceTracks() {
  const horseNames = useSelection(selectHorseNames)

  return (
    <div>
      {horseNames.map((name, index) => (
        <RaceTrack key={index} horseName={name} />
      ))}
    </div>
  )
}

function RaceTrack(props: { horseName: string }) {
  const progress = useSelection((s) => s.progress[props.horseName])
  return (
    <div>
      {props.horseName}: {Math.round(progress * 100)}
    </div>
  )
}
