/**
 * textTexture — 캔버스에 글씨를 그려서 3D 평면에 붙일 텍스처를 만듭니다.
 *
 * 벽에 적히는 큰 글씨(TextPanel)와 작품 위/아래의 작은 캡션(Display)이
 * 모두 이 함수를 사용합니다. 배경은 투명이라 벽에 인쇄된 것처럼 보입니다.
 *
 * 크기 단위는 전부 meter 입니다.
 */

import * as THREE from 'three'
import { CONFIG } from '../config/showroomConfig'

/** 캔버스 1m 당 픽셀. 키우면 더 선명해지고 메모리를 더 씁니다. */
const PX_PER_M = 320

export interface TextRun {
  text: string
  /** 글자 높이 (m) */
  size: number
  weight?: number
  color?: string
  /** 자간 (m) */
  tracking?: number
  /** 이 줄 다음에 추가로 비울 세로 여백 (m) */
  gapAfter?: number
}

export interface TextTextureOptions {
  /** 패널 가로 폭 (m) */
  width: number
  align?: 'left' | 'center' | 'right'
  /** 안쪽 여백 (m) */
  padding?: number
  /** 줄 사이 기본 간격 (m) */
  lineGap?: number
}

export interface TextTextureResult {
  texture: THREE.CanvasTexture
  width: number
  height: number
}

export function makeTextTexture(
  runs: TextRun[],
  { width, align = 'left', padding = 0.16, lineGap = 0.06 }: TextTextureOptions,
): TextTextureResult {
  const font = CONFIG.text.fontFamily

  // ── 전체 높이 계산 ──
  let contentH = 0
  runs.forEach((r, i) => {
    contentH += r.size
    if (i < runs.length - 1) contentH += lineGap
    contentH += r.gapAfter ?? 0
  })

  const canvasW = Math.max(2, Math.round(width * PX_PER_M))
  const canvasH = Math.max(2, Math.round((contentH + padding * 2) * PX_PER_M))

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  const padPx = padding * PX_PER_M
  const x = align === 'center' ? canvasW / 2 : align === 'right' ? canvasW - padPx : padPx
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'

  let y = padPx
  for (const r of runs) {
    const sizePx = r.size * PX_PER_M
    y += sizePx * 0.82 // baseline 보정
    ctx.font = `${r.weight ?? 400} ${sizePx}px ${font}`
    ctx.letterSpacing = `${(r.tracking ?? 0) * PX_PER_M}px`
    ctx.fillStyle = r.color ?? '#f2efe9'
    if (r.text) ctx.fillText(r.text, x, y)
    y += sizePx * 0.18 + lineGap + (r.gapAfter ?? 0)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  return { texture, width, height: canvasH / PX_PER_M }
}
