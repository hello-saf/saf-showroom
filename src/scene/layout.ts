/**
 * ============================================================
 *  LAYOUT — 건축 구조 정의 + 충돌 데이터
 *  -----------------------------------------------------------
 *  벽 / 기둥 / 슬래브 / 계단의 위치를 CONFIG에서 계산합니다.
 *  Architecture.tsx 는 이 데이터를 그대로 렌더링하고,
 *  FirstPersonController 는 같은 데이터로 충돌 처리를 하므로
 *  여기서 벽을 옮기면 시각 + 충돌이 함께 바뀝니다.
 * ============================================================
 */

import { CONFIG, DERIVED } from '../config/showroomConfig'

export interface Box {
  /** 중심 위치 */
  position: [number, number, number]
  /** 크기 [width, height, depth] */
  size: [number, number, number]
  material?: 'wall' | 'floor' | 'ceiling' | 'wood' | 'metal' | 'column'
  /** false 면 충돌 없음 (바닥/천장 등) */
  collide?: boolean
}

const { room, stairs } = CONFIG
const { halfW, halfD, floor2Y } = DERIVED
const T = room.wallThickness
const H = room.totalHeight

/** 자립 전시벽의 z 위치 — exhibits.ts 의 WALL 상수도 이 값을 씁니다 */
export const CENTER_WALL = {
  floor1Z: -4,
  floor1Width: 6,
  floor2Z: 2,
  floor2Width: 5,
}

/* ── 외벽 (1F + 2F 통합) ─────────────────────────────── */
export const WALLS: Box[] = [
  // 북쪽 벽 (z-)
  { position: [0, H / 2, -halfD + T / 2], size: [room.width, H, T], material: 'wall' },
  // 남쪽 벽 (z+)
  { position: [0, H / 2, halfD - T / 2], size: [room.width, H, T], material: 'wall' },
  // 서쪽 벽 (x-)
  { position: [-halfW + T / 2, H / 2, 0], size: [T, H, room.depth], material: 'wall' },
  // 동쪽 벽 (x+)
  { position: [halfW - T / 2, H / 2, 0], size: [T, H, room.depth], material: 'wall' },

  // 계단 옆 벽 (계단을 1F 공간과 분리, 2F에서는 낮은 파라펫이 됨)
  {
    position: [stairs.xMin - 0.08, (floor2Y + 1.05) / 2, (stairs.zBottom + stairs.zTop) / 2],
    size: [0.16, floor2Y + 1.05, stairs.zBottom - stairs.zTop],
    material: 'wall',
  },

  // 1F 중앙 자립 전시벽 (입구에서 정면으로 보이는 벽)
  {
    position: [0, 1.75, CENTER_WALL.floor1Z],
    size: [CENTER_WALL.floor1Width, 3.5, T],
    material: 'wall',
  },
  // 2F 중앙 자립 전시벽
  {
    position: [0, floor2Y + 1.6, CENTER_WALL.floor2Z],
    size: [CENTER_WALL.floor2Width, 3.2, T],
    material: 'wall',
  },
]

/* ── 기둥 ──────────────────────────────────────────────
   지금은 비어 있습니다. 기둥을 다시 세우고 싶으면
   아래처럼 한 줄씩 추가하면 시각 + 충돌이 함께 적용됩니다.

     { position: [-5, H / 2, -7], size: [0.45, H, 0.45], material: 'column' },
*/
export const COLUMNS: Box[] = []

/* ── 난간 (2F 계단 개구부 남쪽 가장자리) ─────────────── */
export const RAILINGS: Box[] = [
  {
    position: [(stairs.xMin + stairs.xMax) / 2, floor2Y + 0.55, 1.8],
    size: [stairs.xMax - stairs.xMin, 1.1, 0.08],
    material: 'metal',
  },
]

/* ── LED 라인 조명 (벽 밑단 코브 라인) ─────────────────
   시각 요소이므로 충돌 없음. 위치를 바꾸려면 아래 배열만 수정하세요. */
const innerX = halfW - T
const innerZ = halfD - T
const STRIP = 0.05 // 라인 두께

function ledStripsForFloor(y: number, skipEastOpening: boolean): Box[] {
  const yy = y + 0.06
  const strips: Box[] = [
    // 북 / 남
    { position: [0, yy, -innerZ + 0.04], size: [room.width - T * 2, STRIP, 0.03] },
    { position: [0, yy, innerZ - 0.04], size: [room.width - T * 2, STRIP, 0.03] },
    // 서
    { position: [-innerX + 0.04, yy, 0], size: [0.03, STRIP, room.depth - T * 2] },
  ]

  if (!skipEastOpening) {
    strips.push({ position: [innerX - 0.04, yy, 0], size: [0.03, STRIP, room.depth - T * 2] })
  } else {
    // 2F 동쪽은 계단 개구부(z −4.2 ~ 1.8)를 피해 두 조각으로
    const northLen = -4.2 + innerZ
    const southLen = innerZ - 1.8
    strips.push({
      position: [innerX - 0.04, yy, (-innerZ + -4.2) / 2],
      size: [0.03, STRIP, northLen],
    })
    strips.push({ position: [innerX - 0.04, yy, (1.8 + innerZ) / 2], size: [0.03, STRIP, southLen] })
  }
  return strips
}

/** 자립 전시벽 상단의 얇은 라인 */
const DISPLAY_WALL_LINES: Box[] = [
  {
    position: [0, 3.52, CENTER_WALL.floor1Z],
    size: [CENTER_WALL.floor1Width, 0.03, T + 0.02],
  },
  {
    position: [0, floor2Y + 3.22, CENTER_WALL.floor2Z],
    size: [CENTER_WALL.floor2Width, 0.03, T + 0.02],
  },
]

export const LED_STRIPS: Box[] = [
  ...ledStripsForFloor(0, false),
  ...ledStripsForFloor(floor2Y, true),
  ...DISPLAY_WALL_LINES,
]

/* ── 바닥 / 천장 / 슬래브 (충돌 없음 — 높이는 ground 함수가 처리) ── */
const OPENING = { xMin: stairs.xMin, xMax: stairs.xMax, zMin: stairs.zTop, zMax: 1.8 }
const slabY = room.floorHeight + room.slabThickness / 2

/** 구조체 슬래브 (천장면 / 슬래브 두께) — 불투명 재질 */
export const SLABS: Box[] = [
  // 2F 천장
  { position: [0, H + 0.075, 0], size: [room.width, 0.15, room.depth], material: 'ceiling', collide: false },
  // 2F 슬래브 두께 (1F 에서 올려다보는 천장면)
  {
    position: [(-halfW + OPENING.xMin) / 2, slabY, 0],
    size: [OPENING.xMin + halfW, room.slabThickness, room.depth],
    material: 'ceiling',
    collide: false,
  },
  {
    position: [(OPENING.xMin + halfW) / 2, slabY, (-halfD + OPENING.zMin) / 2],
    size: [halfW - OPENING.xMin, room.slabThickness, OPENING.zMin + halfD],
    material: 'ceiling',
    collide: false,
  },
  {
    position: [(OPENING.xMin + halfW) / 2, slabY, (OPENING.zMax + halfD) / 2],
    size: [halfW - OPENING.xMin, room.slabThickness, halfD - OPENING.zMax],
    material: 'ceiling',
    collide: false,
  },
]

/** 걸어다니는 바닥면 — 반사 재질이 적용되는 평면들 (y, 그리고 XZ 사각형) */
export interface FloorPanel {
  y: number
  center: [number, number]
  size: [number, number]
}

export const FLOOR_PANELS: FloorPanel[] = [
  // 1F 전체
  { y: 0, center: [0, 0], size: [room.width, room.depth] },
  // 2F — 계단 개구부를 제외한 3조각
  {
    y: floor2Y,
    center: [(-halfW + OPENING.xMin) / 2, 0],
    size: [OPENING.xMin + halfW, room.depth],
  },
  {
    y: floor2Y,
    center: [(OPENING.xMin + halfW) / 2, (-halfD + OPENING.zMin) / 2],
    size: [halfW - OPENING.xMin, OPENING.zMin + halfD],
  },
  {
    y: floor2Y,
    center: [(OPENING.xMin + halfW) / 2, (OPENING.zMax + halfD) / 2],
    size: [halfW - OPENING.xMin, halfD - OPENING.zMax],
  },
]

/* ── 계단 (시각용 스텝 박스) ─────────────────────────── */
export const STAIR_STEPS: Box[] = (() => {
  const boxes: Box[] = []
  const n = stairs.steps
  const stepDepth = DERIVED.stairRun / n
  const stepRise = DERIVED.stairRise / n
  const width = stairs.xMax - stairs.xMin
  const xCenter = (stairs.xMin + stairs.xMax) / 2
  for (let i = 0; i < n; i++) {
    const top = (i + 1) * stepRise
    boxes.push({
      position: [xCenter, top / 2, stairs.zBottom - (i + 0.5) * stepDepth],
      size: [width, top, stepDepth],
      material: 'wood',
      collide: false, // 계단은 ground 함수(경사면)로 처리
    })
  }
  return boxes
})()

/* ── 충돌 박스 (AABB) ────────────────────────────────── */
export interface Collider {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

function toCollider(b: Box): Collider {
  return {
    minX: b.position[0] - b.size[0] / 2,
    maxX: b.position[0] + b.size[0] / 2,
    minY: b.position[1] - b.size[1] / 2,
    maxY: b.position[1] + b.size[1] / 2,
    minZ: b.position[2] - b.size[2] / 2,
    maxZ: b.position[2] + b.size[2] / 2,
  }
}

export const COLLIDERS: Collider[] = [...WALLS, ...COLUMNS, ...RAILINGS]
  .filter((b) => b.collide !== false)
  .map(toCollider)

/* ── 지면 높이 ───────────────────────────────────────── */

/**
 * (x, z) 위치에서 플레이어가 설 수 있는 지면 높이.
 * 후보(1F 바닥, 계단 경사면, 2F 슬래브) 중
 * "현재 발 높이 + stepTolerance" 이하인 가장 높은 면을 고릅니다.
 */
export function groundHeightAt(x: number, z: number, feetY: number): number {
  const candidates = [0]

  // 계단 경사면
  if (x >= stairs.xMin && x <= stairs.xMax && z <= stairs.zBottom && z >= stairs.zTop) {
    const t = (stairs.zBottom - z) / DERIVED.stairRun
    candidates.push(Math.min(DERIVED.stairRise, t * DERIVED.stairRise + 0.09))
  }

  // 2F 슬래브 (계단 개구부 제외)
  const inOpening = x >= OPENING.xMin && x <= OPENING.xMax && z >= OPENING.zMin && z <= OPENING.zMax
  if (!inOpening) candidates.push(floor2Y)

  let ground = 0
  const limit = feetY + CONFIG.player.stepTolerance
  for (const c of candidates) {
    if (c <= limit && c > ground) ground = c
  }
  return ground
}
