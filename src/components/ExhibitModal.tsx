/**
 * ExhibitModal — 전시물 클릭 시 열리는 상세 overlay (HTML/CSS).
 * - image: 원본 aspect ratio 유지한 큰 이미지
 * - youtube: 소리가 켜진 iframe
 * - X 클릭 또는 ESC 로 닫기
 */

import { useEffect } from 'react'
import { useShowroomStore } from '../store'

export function ExhibitModal() {
  const exhibit = useShowroomStore((s) => s.activeExhibit)
  const setActiveExhibit = useShowroomStore((s) => s.setActiveExhibit)

  useEffect(() => {
    if (!exhibit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setActiveExhibit(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [exhibit, setActiveExhibit])

  if (!exhibit) return null

  return (
    <div className="modal">
      <button className="modal-close" onClick={() => setActiveExhibit(null)}>
        ×
      </button>

      <div className="modal-content">
        {exhibit.type === 'youtube' ? (
          <div className="modal-video">
            <iframe
              src={`https://www.youtube.com/embed/${exhibit.youtubeId}?autoplay=1&rel=0`}
              title={exhibit.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : exhibit.image ? (
          <img
            className="modal-image"
            src={exhibit.image}
            alt={exhibit.title}
            onError={(e) => {
              // 이미지가 없으면 placeholder 텍스트로 대체
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement
                ?.querySelector('.modal-placeholder')
                ?.classList.add('modal-placeholder--visible')
            }}
          />
        ) : null}

        {exhibit.type === 'image' && (
          <div className="modal-placeholder">
            <span>IMAGE PLACEHOLDER</span>
          </div>
        )}

        <div className="modal-info">
          <h2>{exhibit.title}</h2>
          {exhibit.year && <span className="modal-year">{exhibit.year}</span>}
          {exhibit.description && <p>{exhibit.description}</p>}
        </div>
      </div>
    </div>
  )
}
