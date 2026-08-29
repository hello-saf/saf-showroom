/**
 * Minimap — 좌측 하단의 원형 미니맵 겸 나침반.
 *
 *  - 현재 층의 평면도를 북쪽이 위로 오도록 그립니다
 *  - 주황색 점 = 내 위치, 부채꼴 = 바라보는 방향
 *  - 테두리의 N / E / S / W 로 방위를 확인합니다
 *
 * 평면도 도형은 showroomConfig / layout 값에서 자동으로 계산되므로
 * 방 크기나 계단 위치를 바꾸면 미니맵도 같이 바뀝니다.
 */

import { CONFIG } from '../config/showroomConfig'
import { useShowroomStore } from '../store'

const SIZE = 112 // SVG 좌표계 지름
const R = SIZE / 2
const PAD = 13 // 원 안쪽 여백 (평면도가 그려지는 영역)

const { room, stairs } = CONFIG

/** 방 전체가 원 안에 들어가도록 하는 배율 */
const SCALE = Math.min((SIZE - PAD * 2) / room.width, (SIZE - PAD * 2) / room.depth)

/** 월드 좌표 → 미니맵 좌표 (북쪽 z− 이 위) */
const mx = (x: number) => R + x * SCALE
const my = (z: number) => R + z * SCALE

const CARDINALS: Array<{ deg: number; label: string }> = [
  { deg: 0, label: 'N' },
  { deg: 90, label: 'E' },
  { deg: 180, label: 'S' },
  { deg: 270, label: 'W' },
]

function polar(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: R + radius * Math.cos(rad), y: R + radius * Math.sin(rad) }
}

export function Minimap() {
  const heading = useShowroomStore((s) => s.heading)
  const floor = useShowroomStore((s) => s.floor)
  const posX = useShowroomStore((s) => s.posX)
  const posZ = useShowroomStore((s) => s.posZ)

  const px = mx(posX)
  const pz = my(posZ)

  // 시야 부채꼴 (반각 26도, heading 방향)
  const half = 26
  const len = 17
  const p1 = {
    x: px + len * Math.cos(((heading - half - 90) * Math.PI) / 180),
    y: pz + len * Math.sin(((heading - half - 90) * Math.PI) / 180),
  }
  const p2 = {
    x: px + len * Math.cos(((heading + half - 90) * Math.PI) / 180),
    y: pz + len * Math.sin(((heading + half - 90) * Math.PI) / 180),
  }
  const cone = `M ${px} ${pz} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${len} ${len} 0 0 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`

  return (
    <div className="minimap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="minimap-svg">
        <defs>
          <clipPath id="minimap-clip">
            <circle cx={R} cy={R} r={R - 1} />
          </clipPath>
        </defs>

        <circle cx={R} cy={R} r={R - 1} className="minimap-face" />

        <g clipPath="url(#minimap-clip)">
          {/* 방 외곽 */}
          <rect
            x={mx(-room.width / 2)}
            y={my(-room.depth / 2)}
            width={room.width * SCALE}
            height={room.depth * SCALE}
            className="minimap-room"
          />

          {/* 계단 */}
          <rect
            x={mx(stairs.xMin)}
            y={my(stairs.zTop)}
            width={(stairs.xMax - stairs.xMin) * SCALE}
            height={(stairs.zBottom - stairs.zTop) * SCALE}
            className="minimap-stairs"
          />

          {/* 자립 전시벽 (층에 따라 다름) */}
          {floor === 2 ? (
            <line x1={mx(-2.5)} y1={my(2)} x2={mx(2.5)} y2={my(2)} className="minimap-wall" />
          ) : (
            <line x1={mx(-3)} y1={my(-4)} x2={mx(3)} y2={my(-4)} className="minimap-wall" />
          )}

          {/* 2F 에서는 계단 개구부를 표시 */}
          {floor === 2 && (
            <rect
              x={mx(stairs.xMin)}
              y={my(stairs.zTop)}
              width={(stairs.xMax - stairs.xMin) * SCALE}
              height={(1.8 - stairs.zTop) * SCALE}
              className="minimap-void"
            />
          )}

          {/* 시야 + 내 위치 */}
          <path d={cone} className="minimap-cone" />
          <circle cx={px} cy={pz} r={3.4} className="minimap-me" />
        </g>

        {/* 방위 글자 */}
        {CARDINALS.map(({ deg, label }) => {
          const p = polar(deg, R - 6)
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              className={`minimap-label ${deg === 0 ? 'minimap-label--north' : ''}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {label}
            </text>
          )
        })}

        <circle cx={R} cy={R} r={R - 1} className="minimap-ring" />
      </svg>

      <span className="minimap-floor">{floor === 2 ? '02F' : '01F'}</span>
    </div>
  )
}
