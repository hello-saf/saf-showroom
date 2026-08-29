import { create } from 'zustand'
import type { Exhibit } from './data/exhibits'

export type AppPhase = 'splash' | 'loading' | 'showroom'

interface ShowroomState {
  phase: AppPhase
  setPhase: (phase: AppPhase) => void

  /** 플레이어가 가까이 있는 전시물 (interaction prompt 용) */
  nearbyExhibit: Exhibit | null
  setNearbyExhibit: (exhibit: Exhibit | null) => void

  /** 클릭해서 열린 전시물 (overlay 용) */
  activeExhibit: Exhibit | null
  setActiveExhibit: (exhibit: Exhibit | null) => void

  /** pointer lock 상태 */
  locked: boolean
  setLocked: (locked: boolean) => void

  /** 현재 층 (1 | 2) */
  floor: number
  setFloor: (floor: number) => void

  /** 바라보는 방위각 (0 = N, 90 = E, 180 = S, 270 = W) — HUD 나침반용 */
  heading: number
  setHeading: (heading: number) => void

  /** 평면상의 현재 위치 [x, z] — 미니맵용 */
  posX: number
  posZ: number
  setPos: (x: number, z: number) => void

  /** 사용자가 한 번이라도 움직였는지 (HUD 힌트 숨김용) */
  hasMoved: boolean
  setHasMoved: () => void
}

export const useShowroomStore = create<ShowroomState>((set) => ({
  phase: 'splash',
  setPhase: (phase) => set({ phase }),

  nearbyExhibit: null,
  setNearbyExhibit: (nearbyExhibit) => set({ nearbyExhibit }),

  activeExhibit: null,
  setActiveExhibit: (activeExhibit) => set({ activeExhibit }),

  locked: false,
  setLocked: (locked) => set({ locked }),

  floor: 1,
  setFloor: (floor) => set({ floor }),

  heading: 0,
  setHeading: (heading) => set({ heading }),

  posX: 0,
  posZ: 0,
  setPos: (posX, posZ) => set({ posX, posZ }),

  hasMoved: false,
  setHasMoved: () => set({ hasMoved: true }),
}))
