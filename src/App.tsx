import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CONFIG } from './config/showroomConfig'
import { useShowroomStore } from './store'
import { SplashScreen } from './components/SplashScreen'
import { LoadingScreen } from './components/LoadingScreen'
import { HUD } from './components/HUD'
import { ExhibitModal } from './components/ExhibitModal'
import { Showroom } from './scene/Showroom'

export default function App() {
  const phase = useShowroomStore((s) => s.phase)
  const setPhase = useShowroomStore((s) => s.setPhase)
  const locked = useShowroomStore((s) => s.locked)
  const activeExhibit = useShowroomStore((s) => s.activeExhibit)
  const [loadingFading, setLoadingFading] = useState(false)

  // 1인칭 조작 중에는 실제 마우스 커서(화살표)를 숨깁니다
  const hideCursor = phase === 'showroom' && locked && !activeExhibit

  // loading → showroom 전환 (짧은 fade)
  useEffect(() => {
    if (phase !== 'loading') return
    const fadeTimer = setTimeout(() => setLoadingFading(true), 900)
    const doneTimer = setTimeout(() => {
      setPhase('showroom')
      setLoadingFading(false)
    }, 1500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [phase, setPhase])

  return (
    <div className={`app ${hideCursor ? 'app--no-cursor' : ''}`}>
      {phase === 'splash' && <SplashScreen />}

      {(phase === 'loading' || phase === 'showroom') && (
        <>
          <Canvas
            dpr={[1, 1.6]}
            camera={{ fov: 60, near: 0.1, far: 120 }}
            shadows="soft"
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              // 전체 밝기 — showroomConfig.ts 의 lights.exposure 에서 조절합니다
              gl.toneMappingExposure = CONFIG.lights.exposure
            }}
          >
            <Showroom />
          </Canvas>
          {phase === 'showroom' && <HUD />}
          {phase === 'showroom' && <ExhibitModal />}
        </>
      )}

      {phase === 'loading' && <LoadingScreen fading={loadingFading} />}
    </div>
  )
}
