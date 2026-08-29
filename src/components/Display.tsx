/**
 * Display — 벽에 붙는 이미지 전시 컴포넌트.
 *
 * - 액자/프레임 없이 이미지가 벽에 그대로 붙습니다.
 * - 이미지 원본 aspect ratio 를 유지하며 CONFIG.display 의
 *   maxWidth × maxHeight 박스 안에 맞도록 크기를 자동 계산합니다.
 *   (exhibits.ts 의 scale 로 작품마다 크기를 다르게 줄 수 있습니다)
 * - 이미지 파일이 없거나 로딩에 실패하면 미니멀한 placeholder 를 표시합니다.
 * - 작품 위/아래에 작은 글씨(캡션)를 넣을 수 있습니다.
 *   exhibits.ts 의 captionTop / captionBottom 을 쓰세요.
 */

import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { CONFIG } from '../config/showroomConfig'
import { makeTextTexture } from '../scene/textTexture'
import type { Exhibit } from '../data/exhibits'

const { display } = CONFIG

/* ── 이미지 로딩 (실패 시 placeholder) ───────────────── */

interface LoadedImage {
  texture: THREE.Texture
  aspect: number // width / height
}

function makePlaceholderTexture(title: string): LoadedImage {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#24272b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(242, 239, 233, 0.22)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)

  ctx.fillStyle = '#f2efe9'
  ctx.font = '600 62px "Helvetica Neue", Arial, sans-serif'
  ctx.letterSpacing = '10px'
  ctx.fillText(title, 80, 160)

  ctx.font = '400 24px "Helvetica Neue", Arial, sans-serif'
  ctx.fillStyle = 'rgba(242, 239, 233, 0.4)'
  ctx.letterSpacing = '8px'
  ctx.fillText('IMAGE PLACEHOLDER', 80, 672)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return { texture, aspect: canvas.width / canvas.height }
}

/**
 * 로고용 변환 — 어떤 형식으로 저장했든 "투명 배경 + 흰 글자" 로 통일합니다.
 *
 * 두 가지 경우를 자동으로 구분합니다.
 *   1. 배경이 투명한 PNG (글자 색은 검정이든 흰색이든 상관없음)
 *      → 원래 투명도를 그대로 쓰고 글자만 흰색으로 칠합니다
 *   2. 배경이 불투명한 이미지 (흰 배경 + 검은 글자 JPG/PNG)
 *      → 밝기를 뒤집어 배경을 투명하게 만듭니다
 */
function toWhiteMask(source: HTMLImageElement): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = source.naturalWidth
  canvas.height = source.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0)

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const p = data.data

  // 투명한 픽셀이 충분히 있으면 "배경이 투명한 로고" 로 봅니다
  let transparentPixels = 0
  const step = 4 * 97 // 듬성듬성 표본만 확인
  let sampled = 0
  for (let i = 3; i < p.length; i += step) {
    sampled++
    if (p[i] < 250) transparentPixels++
  }
  const hasAlpha = sampled > 0 && transparentPixels / sampled > 0.02

  for (let i = 0; i < p.length; i += 4) {
    if (!hasAlpha) {
      const lum = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) / 255
      p[i + 3] = Math.round(255 * (1 - lum))
    }
    p[i] = 255
    p[i + 1] = 255
    p[i + 2] = 255
  }
  ctx.putImageData(data, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function useExhibitImage(
  url: string | undefined,
  title: string,
  mode: 'photo' | 'logo',
): LoadedImage | null | 'missing' {
  const [loaded, setLoaded] = useState<LoadedImage | null | 'missing'>(null)

  useEffect(() => {
    let disposed = false
    let texture: THREE.Texture | null = null

    if (!url) {
      const placeholder = makePlaceholderTexture(title)
      setLoaded(placeholder)
      return () => placeholder.texture.dispose()
    }

    const onFail = () => {
      if (disposed) return
      if (mode === 'logo') {
        // 로고는 placeholder 를 띄우지 않고 조용히 비웁니다
        console.warn(`[showroom] 로고 이미지를 찾을 수 없습니다: ${url}\n` + `  public${url} 위치에 파일을 넣어주세요.`)
        setLoaded('missing')
        return
      }
      const placeholder = makePlaceholderTexture(title)
      texture = placeholder.texture
      setLoaded(placeholder)
    }

    if (mode === 'logo') {
      const el = new Image()
      el.crossOrigin = 'anonymous'
      el.onload = () => {
        if (disposed) return
        const tex = toWhiteMask(el)
        texture = tex
        setLoaded({ texture: tex, aspect: el.naturalWidth / el.naturalHeight })
      }
      el.onerror = onFail
      el.src = url
    } else {
      new THREE.TextureLoader().load(
        url,
        (tex) => {
          if (disposed) return void tex.dispose()
          tex.colorSpace = THREE.SRGBColorSpace
          tex.anisotropy = 4
          texture = tex
          setLoaded({ texture: tex, aspect: tex.image.width / tex.image.height })
        },
        undefined,
        onFail,
      )
    }

    return () => {
      disposed = true
      texture?.dispose()
    }
  }, [url, title, mode])

  return loaded
}

/* ── 작품 위/아래의 작은 캡션 ────────────────────────── */

function Caption({
  lines,
  width,
  y,
  anchor,
}: {
  lines: string[]
  width: number
  /** 이미지 가장자리 y 좌표 */
  y: number
  /** 'above' 면 위쪽으로, 'below' 면 아래쪽으로 붙습니다 */
  anchor: 'above' | 'below'
}) {
  const built = useMemo(
    () =>
      makeTextTexture(
        lines.map((text, i) => ({
          text,
          size: display.captionSize,
          weight: i === 0 ? display.captionWeightFirst : display.captionWeight,
          tracking: display.captionTracking,
          color: i === 0 ? display.captionColor : display.captionColorMuted,
        })),
        {
          width: Math.max(width, 1.2),
          align: display.captionAlign,
          padding: 0,
          lineGap: display.captionLineGap,
        },
      ),
    [lines, width],
  )

  useEffect(() => () => built.texture.dispose(), [built])

  const offset =
    anchor === 'below'
      ? y - display.captionGap - built.height / 2
      : y + display.captionGap + built.height / 2

  return (
    <mesh position={[0, offset, display.wallOffset]}>
      <planeGeometry args={[built.width, built.height]} />
      <meshBasicMaterial map={built.texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/* ── 컴포넌트 ────────────────────────────────────────── */

export function Display({ exhibit }: { exhibit: Exhibit }) {
  const isLogo = exhibit.mode === 'logo'
  const image = useExhibitImage(exhibit.image, exhibit.title, isLogo ? 'logo' : 'photo')
  if (!image || image === 'missing') return null

  /*
    크기 계산 — 원본 비율은 언제나 그대로 유지하고 크기만 조절합니다.
    어떤 비율(16:9 / 4:3 / 1:1 / 3:4 / 9:16)을 넣어도 잘리거나 늘어나지 않습니다.

      fit: 'area' — 넓이를 기준으로 맞추므로 세로 사진과 가로 사진이
                    비슷한 크기감으로 보입니다 (기본값)
      fit: 'box'  — maxWidth × maxHeight 박스 안에 맞춥니다

    작품별 크기는 exhibits.ts 의 scale 로,
    전체 기준 크기는 showroomConfig.ts 의 display 에서 조절합니다.
  */
  const s = exhibit.scale ?? 1

  // 깨진 이미지 등으로 비율이 이상할 때를 대비한 안전장치
  const aspect =
    Number.isFinite(image.aspect) && image.aspect > 0
      ? Math.min(Math.max(image.aspect, 0.2), 5)
      : 1

  let w: number
  let h: number

  if (display.fit === 'area') {
    const area = display.targetArea * s * s
    w = Math.sqrt(area * aspect)
    h = Math.sqrt(area / aspect)
  } else {
    h = Math.min(display.maxWidth / aspect, display.maxHeight) * s
    w = h * aspect
  }

  // 천장·캡션 자리를 위한 절대 한계. 넘으면 비율을 유지한 채 줄입니다.
  const clamp = Math.min(1, display.maxWidth / w, display.maxHeight / h)
  w *= clamp
  h *= clamp

  return (
    <group position={exhibit.position} rotation={exhibit.rotation ?? [0, 0, 0]}>
      {/*
        이미지 — 어두운 공간에서도 작품이 또렷하게 읽히도록
        emissiveMap 으로 은은하게 자체 발광시킵니다.
        더 어둡게/밝게 하려면 showroomConfig 의 display.emissive 를 조절하세요.
      */}
      <mesh position={[0, 0, display.wallOffset]}>
        <planeGeometry args={[w, h]} />
        {isLogo ? (
          // 로고 — 조명을 받지 않는 흰 글씨로 벽에 얹습니다
          <meshBasicMaterial
            map={image.texture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            map={image.texture}
            emissiveMap={image.texture}
            emissive="#ffffff"
            emissiveIntensity={display.emissive}
            toneMapped={false}
            roughness={0.85}
            metalness={0}
          />
        )}
      </mesh>

      {exhibit.captionTop && exhibit.captionTop.length > 0 && (
        <Caption lines={exhibit.captionTop} width={w} y={h / 2} anchor="above" />
      )}
      {exhibit.captionBottom && exhibit.captionBottom.length > 0 && (
        <Caption lines={exhibit.captionBottom} width={w} y={-h / 2} anchor="below" />
      )}
    </group>
  )
}
