/**
 * 건축 구조 렌더링 — layout.ts 의 데이터를 그대로 그립니다.
 * 벽/기둥/계단 위치를 바꾸려면 layout.ts / showroomConfig.ts 를 수정하세요.
 *
 * 바닥은 반사 재질(MeshReflectorMaterial)을 사용합니다.
 * 성능이 부족하면 showroomConfig.ts 의 reflection.enabled 를 false 로 두세요.
 */

import { MeshReflectorMaterial } from '@react-three/drei'
import { CONFIG } from '../config/showroomConfig'
import { MATERIALS, UNIT_BOX } from './Materials'
import { architectureRef } from './occluders'
import {
  WALLS,
  COLUMNS,
  RAILINGS,
  SLABS,
  STAIR_STEPS,
  LED_STRIPS,
  FLOOR_PANELS,
  type Box,
  type FloorPanel,
} from './layout'

const { colors, reflection } = CONFIG

function Boxes({ boxes, castShadow = true }: { boxes: Box[]; castShadow?: boolean }) {
  return (
    <>
      {boxes.map((b, i) => (
        <mesh
          key={i}
          geometry={UNIT_BOX}
          material={MATERIALS[b.material ?? 'wall']}
          position={b.position}
          scale={b.size}
          castShadow={castShadow}
          receiveShadow
        />
      ))}
    </>
  )
}

/** LED 라인 — 발광만 하는 얇은 박스 */
function LedStrips() {
  return (
    <>
      {LED_STRIPS.map((b, i) => (
        <mesh
          key={i}
          geometry={UNIT_BOX}
          material={MATERIALS.ledSoft}
          position={b.position}
          scale={b.size}
        />
      ))}
    </>
  )
}

/** 반사 바닥 */
function ReflectiveFloor({ panel }: { panel: FloorPanel }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[panel.center[0], panel.y + 0.001, panel.center[1]]}
      receiveShadow
    >
      <planeGeometry args={panel.size} />
      {reflection.enabled ? (
        <MeshReflectorMaterial
          resolution={reflection.resolution}
          blur={[reflection.blur, reflection.blur / 3]}
          mixBlur={reflection.mixBlur}
          mixStrength={reflection.mixStrength}
          depthScale={reflection.depthScale}
          minDepthThreshold={reflection.minDepthThreshold}
          maxDepthThreshold={reflection.maxDepthThreshold}
          color={colors.floor}
          roughness={reflection.roughness}
          metalness={reflection.metalness}
          mirror={0}
        />
      ) : (
        <meshStandardMaterial color={colors.floor} roughness={0.3} metalness={0.5} />
      )}
    </mesh>
  )
}

export function Architecture() {
  return (
    <group ref={architectureRef}>
      <Boxes boxes={WALLS} />
      <Boxes boxes={COLUMNS} />
      <Boxes boxes={RAILINGS} />
      <Boxes boxes={SLABS} castShadow={false} />
      <Boxes boxes={STAIR_STEPS} />

      {FLOOR_PANELS.map((p, i) => (
        <ReflectiveFloor key={i} panel={p} />
      ))}

      <LedStrips />
    </group>
  )
}
