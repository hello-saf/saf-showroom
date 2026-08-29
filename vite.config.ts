import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * base 경로
 * -----------------------------------------------------------
 * Vercel / Netlify 같은 곳은 도메인 최상위(/)에서 서비스되므로 그대로 두면 됩니다.
 * GitHub Pages 는 주소가 사용자이름.github.io/저장소이름/ 형태라
 * 저장소 이름을 base 로 붙여야 이미지와 스크립트 경로가 맞습니다.
 *
 * 빌드할 때 환경변수로 지정합니다.
 *   npm run build                          → base '/'   (Vercel 등)
 *   DEPLOY_BASE=/saf-showroom/ npm run build → GitHub Pages
 */
const base = process.env.DEPLOY_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
})
