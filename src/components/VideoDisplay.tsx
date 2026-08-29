/**
 * VideoDisplay — 3D 공간 안에서 실제 YouTube iframe 이 재생되는 스크린.
 *
 * - 영상 교체는 src/data/exhibits.ts 의 youtubeId 만 바꾸면 됩니다.
 * - 브라우저 autoplay 정책 때문에 기본은 muted autoplay 입니다.
 *   소리를 켜려면 가까이 가서 클릭 → overlay(소리 있는 버전)를 엽니다.
 *
 * ⚠️ drei 의 <Html> 은 실제 DOM 을 캔버스 위에 겹쳐 그리므로
 *    벽 뒤에 있어도 비쳐 보입니다. 이를 막기 위해 플레이어가
 *    스크린 근처(같은 층 + activeDistance 이내)에 있을 때만 iframe 을 붙이고,
 *    멀리 있을 때는 꺼진 스크린 패널을 보여줍니다.
 */

import { useRef, useState } from 'react'
import type * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CONFIG } from '../config/showroomConfig'
import { MATERIALS } from '../scene/Materials'
import { architectureRef } from '../scene/occluders'
import type { Exhibit } from '../data/exhibits'

const { video } = CONFIG

// iframe 픽셀 크기 → 3D 크기 변환 (drei Html transform: 1 world unit ≈ 40px)
const IFRAME_W = 800
const IFRAME_H = 450 // 16:9
const PX_PER_UNIT = 40

export function VideoDisplay({ exhibit }: { exhibit: Exhibit }) {
  const [active, setActive] = useState(false)
  const check = useRef(0)

  const w = video.screenWidth
  const h = (w * 9) / 16
  const scale = (w / IFRAME_W) * PX_PER_UNIT

  // 플레이어 거리 체크 (0.25초마다)
  useFrame((state, delta) => {
    check.current += delta
    if (check.current < 0.25) return
    check.current = 0

    const cam = state.camera.position
    const [x, y, z] = exhibit.position
    const sameFloor = Math.abs(cam.y - y) < 3.2
    const dist = Math.hypot(cam.x - x, cam.z - z)
    const next = sameFloor && dist < video.activeDistance
    if (next !== active) setActive(next)
  })

  const src =
    `https://www.youtube.com/embed/${exhibit.youtubeId}` +
    `?autoplay=1&mute=1&loop=1&playlist=${exhibit.youtubeId}` +
    `&controls=1&rel=0&playsinline=1&modestbranding=1`

  return (
    <group position={exhibit.position} rotation={exhibit.rotation ?? [0, 0, 0]}>
      {/* 스크린 프레임 */}
      <mesh material={MATERIALS.frame} castShadow>
        <boxGeometry args={[w + 0.16, h + 0.16, video.frameDepth]} />
      </mesh>

      {/* 꺼진 상태의 스크린 패널 */}
      <mesh position={[0, 0, video.frameDepth / 2 + 0.004]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#0a0b0d" roughness={0.35} metalness={0.3} />
      </mesh>

      {/* 실제 YouTube iframe — 가까이 갔을 때만 */}
      {active && (
        <Html
          transform
          // 벽/기둥이 시야를 가리면 iframe 을 숨깁니다 (DOM 오버레이 비침 방지)
          occlude={[architectureRef as React.RefObject<THREE.Object3D>]}
          position={[0, 0, video.frameDepth / 2 + 0.012]}
          scale={scale}
          style={{ width: `${IFRAME_W}px`, height: `${IFRAME_H}px` }}
          zIndexRange={[0, 0]}
        >
          <iframe
            width={IFRAME_W}
            height={IFRAME_H}
            src={src}
            title={exhibit.title}
            style={{ border: 'none', display: 'block', background: '#000' }}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </Html>
      )}
    </group>
  )
}
