/**
 * Compass — 화면 하단의 방위 리본.
 *
 * 현재 바라보는 방향을 기준으로 좌우 ±WINDOW_DEG 범위의 눈금을 보여줍니다.
 * 중앙의 삼각형 마커가 지금 향한 방향입니다.
 *
 * 눈금 간격 / 범위 / 색은 아래 상수와 styles.css 의 .compass-* 에서 조절합니다.
 */

import { useShowroomStore } from '../store'

/** 중앙 기준 좌우로 보여줄 각도 범위 */
const WINDOW_DEG = 62
/** 눈금 간격 (도) */
const STEP_DEG = 15

/** 방위 라벨 (없으면 각도 숫자를 표시) */
function labelFor(deg: number): string | null {
  switch (((deg % 360) + 360) % 360) {
    case 0:
      return 'N'
    case 45:
      return 'NE'
    case 90:
      return 'E'
    case 135:
      return 'SE'
    case 180:
      return 'S'
    case 225:
      return 'SW'
    case 270:
      return 'W'
    case 315:
      return 'NW'
    default:
      return null
  }
}

/** a 에서 b 까지의 최단 각도 차이 (-180 ~ 180) */
function angleDelta(a: number, b: number): number {
  let d = ((b - a + 540) % 360) - 180
  if (d === -180) d = 180
  return d
}

export function Compass() {
  const heading = useShowroomStore((s) => s.heading)

  // 화면에 보일 눈금 목록
  const ticks: Array<{ deg: number; delta: number; label: string | null }> = []
  const start = Math.floor((heading - WINDOW_DEG) / STEP_DEG) * STEP_DEG
  for (let deg = start; deg <= heading + WINDOW_DEG + STEP_DEG; deg += STEP_DEG) {
    const delta = angleDelta(heading, deg)
    if (Math.abs(delta) > WINDOW_DEG) continue
    ticks.push({ deg, delta, label: labelFor(deg) })
  }

  return (
    <div className="compass">
      <span className="compass-marker compass-marker--top" />
      <div className="compass-track">
        {ticks.map(({ deg, delta, label }) => {
          const pct = 50 + (delta / WINDOW_DEG) * 50
          // 가장자리로 갈수록 흐려집니다
          const fade = 1 - Math.min(1, Math.abs(delta) / WINDOW_DEG) ** 2
          return (
            <div
              key={deg}
              className={`compass-tick ${label ? 'compass-tick--cardinal' : ''}`}
              style={{ left: `${pct}%`, opacity: 0.15 + fade * 0.85 }}
            >
              <span className="compass-tick-line" />
              <span className="compass-tick-label">
                {label ?? (((deg % 360) + 360) % 360)}
              </span>
            </div>
          )
        })}
      </div>
      <span className="compass-marker compass-marker--bottom" />
    </div>
  )
}
