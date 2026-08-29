/**
 * LoadingScreen — Splash → Showroom 사이의 짧은 전환 화면.
 */

export function LoadingScreen({ fading }: { fading: boolean }) {
  return (
    <div className={`loading ${fading ? 'loading--fading' : ''}`}>
      <span className="loading-text">LOADING</span>
    </div>
  )
}
