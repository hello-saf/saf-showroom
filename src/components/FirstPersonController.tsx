/**
 * FirstPersonController — WASD 이동 + 마우스 시점 + 중력 + 충돌.
 *
 * - 클릭 → pointer lock, ESC → 해제
 * - 벽/기둥/난간은 layout.ts 의 COLLIDERS 로 충돌 처리 (원 vs AABB)
 * - 바닥/계단/2F 는 groundHeightAt() 으로 높이 처리 (계단 = 경사면)
 * - 속도/감도/눈높이는 showroomConfig.ts 의 player 에서 관리
 */

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CONFIG } from '../config/showroomConfig'
import { COLLIDERS, groundHeightAt } from '../scene/layout'
import { useShowroomStore } from '../store'
import { exhibits } from '../data/exhibits'

const { player, display } = CONFIG

export function FirstPersonController() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef<number>(player.spawn.yaw)
  const pitch = useRef<number>(0)
  const pos = useRef<{ x: number; z: number }>({ x: player.spawn.x, z: player.spawn.z })
  const feetY = useRef<number>(0)
  const velY = useRef(0)
  const velX = useRef(0)
  const velZ = useRef(0)
  const proximityTimer = useRef(0)

  /* ── 입력 이벤트 ─────────────────────────────────────
     마우스 시점은 두 가지 방식을 모두 지원합니다.
       1) pointer lock  — 일반 브라우저의 기본 동작 (마우스를 그냥 움직이면 회전)
       2) drag fallback — pointer lock 이 차단된 환경(iframe/미리보기)에서
                          마우스를 누른 채 움직이면 회전
  */
  useEffect(() => {
    const canvas = gl.domElement
    const store = useShowroomStore

    /** pointer lock 이 거부되면 true 로 바뀌고 free-look 방식으로 전환됩니다 */
    let dragFallback = false
    let dragging = false
    let downX = 0
    let downY = 0
    let moved = 0

    const applyLook = (dx: number, dy: number) => {
      yaw.current -= dx * player.mouseSensitivity
      pitch.current -= dy * player.mouseSensitivity
      pitch.current = Math.max(-1.4, Math.min(1.4, pitch.current))
    }

    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas
      if (locked) dragFallback = false
      // 드래그 모드에서는 lock 해제 이벤트로 상태를 끄지 않습니다
      if (locked || !dragFallback) store.getState().setLocked(locked)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (store.getState().activeExhibit) return

      if (document.pointerLockElement === canvas) {
        applyLook(e.movementX, e.movementY)
        return
      }

      if (!dragFallback) return

      // free-look: 버튼을 누르지 않아도 마우스를 움직이면 시점이 돌아갑니다
      if (dragging) moved += Math.abs(e.movementX) + Math.abs(e.movementY)
      if (store.getState().locked) applyLook(e.movementX, e.movementY)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true
      if (e.code === 'Escape' && dragFallback) {
        dragging = false
        store.getState().setLocked(false)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }

    /** UI 요소(모달/버튼/YouTube iframe) 위의 클릭은 무시 */
    const isUiTarget = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest('.modal, button, iframe')

    const onMouseDown = (e: MouseEvent) => {
      if (store.getState().activeExhibit || isUiTarget(e.target)) return
      dragging = true
      moved = 0
      downX = e.clientX
      downY = e.clientY
    }

    const onMouseUp = (e: MouseEvent) => {
      const wasDragging = dragging
      dragging = false
      if (store.getState().activeExhibit) return

      const travelled = moved + Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY)
      const isClick = wasDragging && travelled < 6
      if (!isClick) return

      const s = store.getState()

      // 이미 조작 중이고 가까운 전시물이 있으면 → 열기
      if (s.locked && s.nearbyExhibit) {
        s.setActiveExhibit(s.nearbyExhibit)
        if (document.pointerLockElement === canvas) document.exitPointerLock()
        return
      }

      // 조작 시작
      if (!s.locked) {
        if (dragFallback) {
          s.setLocked(true)
          return
        }
        try {
          const result = canvas.requestPointerLock() as unknown
          if (result instanceof Promise) {
            result.catch(() => {
              dragFallback = true
              store.getState().setLocked(true)
            })
          }
        } catch {
          dragFallback = true
          s.setLocked(true)
        }
      }
    }

    /*
      개발 편의: 브라우저 콘솔에서 원하는 위치·방향으로 즉시 이동할 수 있습니다.
      전시물 좌표를 조정할 때 걸어가지 않고 바로 확인하기 위한 용도입니다.
      (프로덕션 빌드에는 포함되지 않습니다)

        goto(x, z, yawRad, feetY)

        yawRad : 0 = 북쪽 / Math.PI/2 = 서쪽 / -Math.PI/2 = 동쪽 / PI = 남쪽
        feetY  : 발이 닿는 높이. 1F = 0, 2F = 4.65,
                 계단 중간은 대략 (6.8 - z) / 11 * 4.65

        예) goto(-6, 9.5, Math.PI / 2)        1F 서쪽 벽 앞
            goto(0, -8, 0, 4.65)              2F 북쪽 벽 앞
            goto(8.7, 3.2, Math.PI / 2, 1.6)  계단 중간
    */
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).goto = (
        gx: number,
        gz: number,
        gyaw = 0,
        gFeetY = 0,
      ) => {
        pos.current.x = gx
        pos.current.z = gz
        yaw.current = gyaw
        pitch.current = 0
        feetY.current = gFeetY
        velX.current = 0
        velZ.current = 0
        velY.current = 0
        return `moved to ${gx}, ${gz} (feetY ${gFeetY})`
      }
    }

    // 창 포커스를 잃으면 눌려 있던 키를 모두 해제 (탭 전환 시 계속 걷는 것 방지)
    const onBlur = () => {
      keys.current = {}
      dragging = false
    }

    // pointer lock 이 브라우저/환경에 의해 거부되면 드래그 방식으로 전환
    const onLockError = () => {
      dragFallback = true
      store.getState().setLocked(true)
    }

    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('pointerlockerror', onLockError)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('blur', onBlur)

    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('pointerlockerror', onLockError)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [gl])

  /* ── 매 프레임 이동 처리 ─────────────────────────── */
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const store = useShowroomStore.getState()
    const locked = store.locked && !store.activeExhibit

    // 키보드로도 좌우를 돌아볼 수 있게 (Q / E, ← →)
    if (locked) {
      let turn = 0
      if (keys.current['KeyQ']) turn += 1
      if (keys.current['KeyE']) turn -= 1
      if (turn !== 0) yaw.current += turn * player.keyTurnSpeed * dt
    }

    // 입력 방향
    let ix = 0
    let iz = 0
    if (locked) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) iz -= 1
      if (keys.current['KeyS'] || keys.current['ArrowDown']) iz += 1
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) ix -= 1
      if (keys.current['KeyD'] || keys.current['ArrowRight']) ix += 1
    }

    // Shift 를 누르고 있으면 조금 빠르게 걷습니다
    const running = keys.current['ShiftLeft'] || keys.current['ShiftRight']
    const speed = player.speed * (running ? player.runMultiplier : 1)

    // yaw 기준으로 회전
    const len = Math.hypot(ix, iz)
    let tx = 0
    let tz = 0
    if (len > 0) {
      ix /= len
      iz /= len
      const sin = Math.sin(yaw.current)
      const cos = Math.cos(yaw.current)
      tx = (ix * cos + iz * sin) * speed
      tz = (iz * cos - ix * sin) * speed
      if (!store.hasMoved) store.setHasMoved()
    }

    // 부드러운 가감속
    const smooth = 1 - Math.exp(-12 * dt)
    velX.current += (tx - velX.current) * smooth
    velZ.current += (tz - velZ.current) * smooth

    pos.current.x += velX.current * dt
    pos.current.z += velZ.current * dt
    resolveCollisions(pos.current, feetY.current)

    // 지면 / 중력
    const ground = groundHeightAt(pos.current.x, pos.current.z, feetY.current)
    if (feetY.current <= ground + 0.001) {
      feetY.current = ground
      velY.current = 0
    } else {
      velY.current -= player.gravity * dt
      feetY.current = Math.max(feetY.current + velY.current * dt, ground)
    }

    // 카메라 적용 (roll 은 항상 0 — 수평선이 기울지 않도록)
    camera.position.set(pos.current.x, feetY.current + player.cameraHeight, pos.current.z)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')

    // 층 표시
    const floor = feetY.current > CONFIG.room.floorHeight * 0.55 ? 2 : 1
    if (floor !== store.floor) store.setFloor(floor)

    // 전시물 근접 체크 + 나침반 방위각 갱신 (0.12초마다)
    proximityTimer.current += dt
    if (proximityTimer.current > 0.12) {
      proximityTimer.current = 0
      updateNearbyExhibit(pos.current.x, feetY.current, pos.current.z)

      // yaw 0 = 북쪽(-Z), 시계방향으로 증가하는 방위각으로 변환
      const deg = (((-yaw.current * 180) / Math.PI) % 360 + 360) % 360
      if (Math.abs(deg - store.heading) > 0.4) store.setHeading(deg)

      // 미니맵용 위치
      if (
        Math.abs(pos.current.x - store.posX) > 0.05 ||
        Math.abs(pos.current.z - store.posZ) > 0.05
      ) {
        store.setPos(pos.current.x, pos.current.z)
      }
    }
  })

  return null
}

/* ── 원(플레이어) vs AABB 충돌 해결 ──────────────────── */
function resolveCollisions(p: { x: number; z: number }, feetY: number) {
  const r = player.radius
  const bodyBottom = feetY + 0.2
  const bodyTop = feetY + 1.8

  for (const c of COLLIDERS) {
    if (bodyTop < c.minY || bodyBottom > c.maxY) continue

    const cx = Math.max(c.minX, Math.min(p.x, c.maxX))
    const cz = Math.max(c.minZ, Math.min(p.z, c.maxZ))
    const dx = p.x - cx
    const dz = p.z - cz
    const d2 = dx * dx + dz * dz

    if (d2 >= r * r) continue

    if (d2 > 1e-9) {
      // 박스 바깥 → 법선 방향으로 밀어냄
      const d = Math.sqrt(d2)
      const push = (r - d) / d
      p.x += dx * push
      p.z += dz * push
    } else {
      // 박스 내부 → 가장 얕은 면으로 밀어냄
      const pushLeft = p.x - c.minX + r
      const pushRight = c.maxX - p.x + r
      const pushBack = p.z - c.minZ + r
      const pushFront = c.maxZ - p.z + r
      const min = Math.min(pushLeft, pushRight, pushBack, pushFront)
      if (min === pushLeft) p.x = c.minX - r
      else if (min === pushRight) p.x = c.maxX + r
      else if (min === pushBack) p.z = c.minZ - r
      else p.z = c.maxZ + r
    }
  }
}

/* ── 근접 전시물 탐색 ────────────────────────────────── */
function updateNearbyExhibit(x: number, feetY: number, z: number) {
  const store = useShowroomStore.getState()
  const eyeY = feetY + player.cameraHeight

  let best: (typeof exhibits)[number] | null = null
  let bestDist: number = display.interactionDistance

  for (const e of exhibits) {
    // 벽에 적힌 글씨와 로고는 클릭 대상이 아님
    if (e.type === 'text' || e.mode === 'logo') continue
    const dy = e.position[1] - eyeY
    if (Math.abs(dy) > 2.5) continue // 다른 층 제외

    // 플레이어 → 작품 방향
    const dx = x - e.position[0]
    const dz = z - e.position[2]
    const dist = Math.hypot(dx, dz)
    if (dist >= bestDist) continue

    // 작품의 정면 방향(법선)에 플레이어가 있어야 함.
    // 같은 벽 앞뒤에 걸린 작품이 벽 너머로 반응하는 것을 막습니다.
    const ry = e.rotation?.[1] ?? 0
    const facing = dx * Math.sin(ry) + dz * Math.cos(ry)
    if (facing <= 0.05) continue

    bestDist = dist
    best = e
  }

  if (store.nearbyExhibit?.id !== best?.id) {
    store.setNearbyExhibit(best)
  }
}
