/**
 * Showroom — 3D 씬 루트. 건축 + 조명 + 전시물 + 플레이어.
 */

import { useThree } from '@react-three/fiber'
import { CONFIG } from '../config/showroomConfig'
import { exhibits } from '../data/exhibits'
import { Architecture } from './Architecture'
import { Lighting } from './Lighting'
import { Display } from '../components/Display'
import { VideoDisplay } from '../components/VideoDisplay'
import { TextPanel } from '../components/TextPanel'
import { FirstPersonController } from '../components/FirstPersonController'

function DebugSceneRef() {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const w = window as unknown as Record<string, unknown>
  w.__scene = scene
  w.__camera = camera
  return null
}

export function Showroom() {
  return (
    <>
      <color attach="background" args={[CONFIG.colors.background]} />

      <Lighting />
      <Architecture />

      {exhibits.map((exhibit) => {
        if (exhibit.type === 'youtube') return <VideoDisplay key={exhibit.id} exhibit={exhibit} />
        if (exhibit.type === 'text') return <TextPanel key={exhibit.id} exhibit={exhibit} />
        return <Display key={exhibit.id} exhibit={exhibit} />
      })}

      <FirstPersonController />
      <DebugSceneRef />
    </>
  )
}
