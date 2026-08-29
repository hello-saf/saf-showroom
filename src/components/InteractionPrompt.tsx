/**
 * InteractionPrompt — 전시물 근처에서만 화면 상단에 나타나는 한 줄 안내.
 *
 * 작품 이름은 표시하지 않습니다. (작품 옆 캡션이 그 역할을 합니다)
 * 문구는 아래 한 줄만 고치면 됩니다.
 */

import { useShowroomStore } from '../store'

export function InteractionPrompt() {
  const nearby = useShowroomStore((s) => s.nearbyExhibit)
  const locked = useShowroomStore((s) => s.locked)
  const activeExhibit = useShowroomStore((s) => s.activeExhibit)

  if (!nearby || !locked || activeExhibit) return null

  return (
    <div className="interaction-prompt">
      CLICK TO VIEW {nearby.type === 'youtube' ? 'THIS FILM' : 'THIS WORK'} IN DETAIL
    </div>
  )
}
