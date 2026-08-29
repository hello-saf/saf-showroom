/**
 * SplashScreen — 진입 화면. 스타일은 styles.css 의 .splash-* 에서 관리합니다.
 * 텍스트/레이아웃을 바꾸려면 이 파일과 styles.css 만 수정하면 됩니다.
 */

import { useShowroomStore } from '../store'

export function SplashScreen() {
  const setPhase = useShowroomStore((s) => s.setPhase)

  return (
    <div className="splash">
      <header className="splash-header">
        <span>SAF — PERSONAL PORTFOLIO</span>
        <span>SELECTED WORKS / 2026</span>
      </header>

      <main className="splash-main">
        <h1 className="splash-title">SHOWROOM</h1>
        <p className="splash-subtitle">DIGITAL VISUAL EXPERIENCE</p>
      </main>

      <footer className="splash-footer">
        <div className="splash-meta">
          <span>3D INTERACTIVE SPACE</span>
          <span>2 FLOORS</span>
          <span>DESKTOP ONLY</span>
        </div>
        <button className="splash-enter" onClick={() => setPhase('loading')}>
          ENTER <span className="splash-enter-arrow">→</span>
        </button>
      </footer>
    </div>
  )
}
