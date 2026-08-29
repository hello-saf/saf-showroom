/**
 * 조명 — 어두운 갤러리 무드.
 *
 * 구성:
 *   1. 아주 낮은 ambient (형태만 겨우 보이는 수준)
 *   2. 천장 매입 스팟 — 바닥에 부드러운 빛 웅덩이를 만듭니다
 *   3. 바닥 LED 라인 주변의 약한 워시 라이트
 *
 * 작품 자체는 Display.tsx 에서 emissive 로 밝게 처리하므로
 * 작품마다 별도 조명을 두지 않습니다 (성능).
 *
 * 강도/색/개수는 showroomConfig.ts 의 lights 에서 관리합니다.
 */

import { useMemo } from 'react'
import * as THREE from 'three'
import { CONFIG, DERIVED } from '../config/showroomConfig'
import { UNIT_CIRCLE } from './Materials'

const { lights, room } = CONFIG

const CEILING_1F = room.floorHeight - 0.06
const CEILING_2F = room.totalHeight - 0.06

/** 천장 매입 스팟: [x, ceilingY, z, 조준 대상 y] */
const SPOTS: Array<{ pos: [number, number, number]; target: [number, number, number]; shadow?: boolean }> = [
  // ── 1F ──
  { pos: [-6.5, CEILING_1F, -10], target: [-8.5, 1.8, -11], shadow: true },
  { pos: [6.5, CEILING_1F, -10], target: [8.5, 1.8, -11] },
  { pos: [-4, CEILING_1F, -1.5], target: [-4, 0, -1.5] },
  { pos: [4, CEILING_1F, -1.5], target: [4, 0, -1.5] },
  { pos: [0, CEILING_1F, 6], target: [0, 0, 7.5] },
  { pos: [-6.5, CEILING_1F, 9], target: [-8.5, 1.6, 10] },

  // ── 2F ──
  { pos: [-6, CEILING_2F, -8], target: [-8.5, DERIVED.floor2Y + 1.8, -8], shadow: true },
  { pos: [-6, CEILING_2F, 3], target: [-8.5, DERIVED.floor2Y + 1.8, 3.5] },
  { pos: [4, CEILING_2F, -11], target: [4, DERIVED.floor2Y + 1.4, -13] },
  { pos: [-3, CEILING_2F, -2], target: [-3, DERIVED.floor2Y, -2] },
  { pos: [2, CEILING_2F, 0], target: [1, DERIVED.floor2Y + 1.6, 2] },
  { pos: [3, CEILING_2F, 6], target: [3, DERIVED.floor2Y, 6.5] },
  { pos: [-2, CEILING_2F, 10], target: [-2, DERIVED.floor2Y, 11] },
]

/** LED 라인 워시 — 바닥 근처에서 벽을 은은하게 밝힙니다 */
const LED_WASH: Array<[number, number, number]> = [
  [-8.4, 0.7, -10],
  [-8.4, 0.7, -1],
  [-8.4, 0.7, 8],
  [8.4, 0.7, -10],
  [8.4, 0.7, 2],
  [0, 0.7, 12.2],
  [0, 0.7, -12.2],
  [-8.4, DERIVED.floor2Y + 0.7, -8],
  [-8.4, DERIVED.floor2Y + 0.7, 3],
  [0, DERIVED.floor2Y + 0.7, -12.2],
  [0, DERIVED.floor2Y + 0.7, 12.2],
]

function RecessedSpot({
  pos,
  target,
  shadow,
}: {
  pos: [number, number, number]
  target: [number, number, number]
  shadow?: boolean
}) {
  const targetObj = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(...target)
    return o
  }, [target])

  return (
    <group>
      {/* 매입 등기구 (시각) */}
      <mesh geometry={UNIT_CIRCLE} position={pos} rotation={[Math.PI / 2, 0, 0]} scale={0.17}>
        <meshBasicMaterial color={lights.spotColor} />
      </mesh>

      <primitive object={targetObj} />
      <spotLight
        position={pos}
        target={targetObj}
        intensity={lights.spotIntensity}
        color={lights.spotColor}
        angle={lights.spotAngle}
        penumbra={lights.spotPenumbra}
        distance={16}
        decay={1.6}
        castShadow={shadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0015}
      />
    </group>
  )
}

export function Lighting() {
  return (
    <>
      <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />

      {SPOTS.map((s, i) => (
        <RecessedSpot key={i} pos={s.pos} target={s.target} shadow={s.shadow} />
      ))}

      {LED_WASH.map((p, i) => (
        <pointLight
          key={i}
          position={p}
          intensity={lights.ledIntensity}
          color={lights.ledColor}
          distance={lights.ledDistance}
          decay={2}
        />
      ))}
    </>
  )
}
