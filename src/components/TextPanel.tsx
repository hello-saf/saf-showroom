/**
 * TextPanel — 벽에 직접 글씨가 적혀 있는 느낌의 텍스트 전시.
 *
 * 이미지 없이 타이포그래피만 벽에 얹습니다.
 * (배경이 투명한 캔버스 텍스처라 벽면 위에 인쇄된 것처럼 보입니다)
 *
 * exhibits.ts 에서 type: 'text' 로 지정하고
 *   heading / body / textWidth / align / rule
 * 를 주면 됩니다. 서체·크기·자간은 showroomConfig.ts 의 text 에서 조절합니다.
 */

import { useEffect, useMemo } from 'react'
import { CONFIG } from '../config/showroomConfig'
import { makeTextTexture, type TextRun } from '../scene/textTexture'
import type { Exhibit } from '../data/exhibits'

const { text: STYLE } = CONFIG

export function TextPanel({ exhibit }: { exhibit: Exhibit }) {
  const built = useMemo(() => {
    const runs: TextRun[] = []

    const heading = exhibit.heading ?? exhibit.title
    if (heading) {
      runs.push({
        text: heading,
        size: STYLE.headingSize,
        weight: STYLE.headingWeight,
        tracking: STYLE.headingTracking,
        color: STYLE.headingColor,
        gapAfter: STYLE.headingGap,
      })
    }

    for (const line of exhibit.body ?? []) {
      runs.push({
        text: line,
        size: STYLE.bodySize,
        weight: STYLE.bodyWeight,
        tracking: STYLE.bodyTracking,
        color: STYLE.bodyColor,
      })
    }

    return makeTextTexture(runs, {
      width: exhibit.textWidth ?? STYLE.defaultWidth,
      align: exhibit.align ?? 'left',
      padding: STYLE.padding,
      lineGap: STYLE.lineGap,
    })
  }, [exhibit])

  useEffect(() => () => built.texture.dispose(), [built])

  const { texture, width, height } = built

  return (
    <group position={exhibit.position} rotation={exhibit.rotation ?? [0, 0, 0]}>
      <mesh position={[0, 0, CONFIG.display.wallOffset]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* 제목 위의 얇은 규칙선 (editorial detail) */}
      {exhibit.rule !== false && (
        <mesh
          position={[
            -width / 2 + STYLE.padding + STYLE.ruleWidth / 2,
            height / 2 - STYLE.padding * 0.4,
            CONFIG.display.wallOffset,
          ]}
        >
          <planeGeometry args={[STYLE.ruleWidth, 0.01]} />
          <meshBasicMaterial color={STYLE.headingColor} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
