import React from 'react'
import { useQuery } from '../Store'
import { selectHorseNames } from '../Selectors'

export default function RaceTracks() {
  const horseNames = useQuery(selectHorseNames)

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
