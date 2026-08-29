/**
 * HUD — 화면 위에 얹히는 UI.
 *
 *  - 네 모서리 + 좌우 중앙의 코너 마크 (프레이밍용 테두리)
 *  - 하단 방위 나침반 (Compass.tsx)
 *  - 우측 하단 키 안내
 *  - 좌측 상단 층 표시
 *  - 입장 직후의 조작 힌트 (움직이면 사라짐)
 *
 * 색과 위치는 styles.css 의 .hud-* / .compass-* 에서 조절합니다.
 */

import { useEffect, useState } from 'react'
import { useShowroomStore } from '../store'
import { InteractionPrompt } from './InteractionPrompt'
import { Compass } from './Compass'
import { Minimap } from './Minimap'

/** 화면을 프레이밍하는 코너 마크 */
function CornerMarks() {
  const spots = [
    'tl',
    'tr',
    'bl',
    'br',
    'ml',
    'mr',
  ] as const

  return (
    <div className="hud-corners">
      {spots.map((s) => (
        <span key={s} className={`hud-corner hud-corner--${s}`}>
          <span className="hud-corner-v" />
          <span className="hud-corner-h" />
          <span className="hud-corner-dot" />
        </span>
      ))}
    </div>
  )
}

export function HUD() {
  const locked = useShowroomStore((s) => s.locked)
  const hasMoved = useShowroomStore((s) => s.hasMoved)
  const activeExhibit = useShowroomStore((s) => s.activeExhibit)

  // 조작 힌트: 5초 후 또는 움직이기 시작하면 숨김
  const [hintExpired, setHintExpired] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHintExpired(true), 5000)
    return () => clearTimeout(t)
  }, [])
  const showHint = !hasMoved && !hintExpired && !activeExhibit

  // 오버레이가 열려 있을 때는 HUD 를 비웁니다
  if (activeExhibit) return null

  return (
    <div className="hud">
      <CornerMarks />

      {/* 크로스헤어 */}
      {locked && <div className="hud-crosshair" />}

      {/* 하단 방위 리본 + 좌측 하단 미니맵 */}
      {locked && <Compass />}
      {locked && <Minimap />}

      {/* 우측 하단 키 안내 */}
      {locked && (
        <div className="hud-keys">
          <div className="hud-keys-row">
            <span className="hud-keycap">ESC</span>
            <span>KEY TO EXIT FIRST PERSON VIEW</span>
          </div>
          <div className="hud-keys-divider" />
          <div className="hud-keys-row">
            <span className="hud-keycap">Q / E</span>
            <span>KEY TO TURN LEFT AND RIGHT</span>
          </div>
          <div className="hud-keys-divider" />
          <div className="hud-keys-row">
            <span className="hud-keycap">SHIFT</span>
            <span>KEY TO WALK FASTER</span>
          </div>
        </div>
      )}

      {/* 조작 힌트 */}
      {showHint && (
        <div className="hud-controls">
          <div className="hud-controls-row">
            <span className="hud-key">W A S D</span>
            <span>MOVE</span>
          </div>
          <div className="hud-controls-row">
            <span className="hud-key">MOUSE</span>
            <span>LOOK AROUND</span>
          </div>
          <div className="hud-controls-row">
            <span className="hud-key">CLICK</span>
            <span>INTERACT</span>
          </div>
        </div>
      )}

      {/* 조작 시작 안내 */}
      {!locked && <div className="hud-click-hint">CLICK TO ENTER FIRST PERSON VIEW</div>}

      <InteractionPrompt />
    </div>
  )
}
