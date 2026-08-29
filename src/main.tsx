import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useShowroomStore } from './store'
import './styles.css'

// DEV 전용: 브라우저 콘솔에서 상태 확인용
if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>
  w.__store = useShowroomStore
  import('./scene/layout').then((m) => {
    w.__colliders = m.COLLIDERS
    w.__ground = m.groundHeightAt
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
