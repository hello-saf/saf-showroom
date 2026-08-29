/**
 * ============================================================
 *  EXHIBITS — 전시 작품 데이터
 *  -----------------------------------------------------------
 *  작품 추가 / 위치 / 크기 변경은 이 파일만 수정하면 됩니다.
 *
 *  type 은 세 가지입니다.
 *    'image'   — 벽에 붙는 이미지 (public/images/ 에 파일을 넣으세요)
 *    'youtube' — 3D 공간 안에서 실제로 재생되는 YouTube 스크린
 *    'text'    — 이미지 없이 벽에 직접 적히는 글씨
 *
 *  현재 이미지는 project-01.jpg ~ project-12.jpg 12장을 사용합니다.
 *  작품을 더 넣으려면 파일을 추가하고 아래 배열에 항목을 하나 복사하세요.
 *
 *  ── 자주 바꾸게 되는 값 ─────────────────────────────────
 *    position : [x, y, z]  — y 를 바꾸면 걸리는 높이가 달라집니다
 *    scale    : 크기 배율 (0.8 작게 / 1.0 기본 / 1.3 크게)
 *    rotation : 어느 벽에 붙는지 (아래 WALL 상수 사용 권장)
 *
 *  ── 벽면 좌표 ───────────────────────────────────────────
 *  WALL 상수는 showroomConfig 의 방 크기에서 자동으로 계산됩니다.
 *  방 크기를 바꿔도 작품이 벽에 정확히 붙은 채로 따라갑니다.
 *
 *    WALL.north / south / west / east   외벽 네 면
 *    WALL.center1Front / center1Back    1F 중앙 자립 전시벽 앞·뒷면
 *    WALL.center2Front / center2Back    2F 중앙 자립 전시벽 앞·뒷면
 *    WALL.stairInner                    계단 옆 벽 (오르내리며 보이는 면)
 *
 *  높이(y) 기준: 1F 눈높이 ≈ 1.68 / 2F 눈높이 ≈ 6.33
 *  ※ 1F 동쪽 벽의 계단 구간(z −4.2 ~ 6.8)에는 작품을 걸 수 없습니다.
 * ============================================================
 */

import { CONFIG, DERIVED } from '../config/showroomConfig'
import { CENTER_WALL } from '../scene/layout'

export type ExhibitType = 'image' | 'youtube' | 'text'

export interface Exhibit {
  id: string
  type: ExhibitType
  title: string
  floor: number
  position: [number, number, number]
  rotation?: [number, number, number]

  /** type: 'image' */
  image?: string

  /**
   * 작품 크기 배율 (기본 1). 0.8 = 작게 / 1.3 = 크게.
   * 원본 비율은 항상 유지되고 크기만 달라집니다.
   */
  scale?: number

  /**
   * 'logo' 로 두면 흰 배경 + 검은 글자 이미지를
   * "투명 배경 + 흰 글자" 로 바꿔서 벽에 직접 인쇄된 것처럼 보여줍니다.
   * 클릭 대상에서도 제외됩니다. (기본값은 일반 사진)
   */
  mode?: 'photo' | 'logo'

  /**
   * 작품 위 / 아래에 붙는 작은 글씨. 줄 단위 배열입니다.
   * 첫 줄은 조금 더 밝고 굵게, 나머지 줄은 흐리게 표시됩니다.
   */
  captionTop?: string[]
  captionBottom?: string[]

  /** type: 'youtube' */
  youtubeId?: string

  /** type: 'text' — 벽에 직접 적히는 글씨 */
  heading?: string //       큰 글씨 (없으면 title 사용)
  body?: string[] //        아래 작은 글씨, 줄 단위 배열
  textWidth?: number //     글씨 블록 가로 폭 (m)
  align?: 'left' | 'center'
  rule?: boolean //         제목 위 짧은 선. 숨기려면 false

  year?: string
  description?: string
}

const PI = Math.PI
const T = CONFIG.room.wallThickness
const OFF = 0.04 // 벽 표면에서 살짝 띄우는 거리

/** 벽 안쪽 면 좌표 + 정면 회전값 (방 크기에서 자동 계산) */
export const WALL = {
  north: { z: -DERIVED.halfD + T + OFF, rot: [0, 0, 0] as [number, number, number] },
  south: { z: DERIVED.halfD - T - OFF, rot: [0, PI, 0] as [number, number, number] },
  west: { x: -DERIVED.halfW + T + OFF, rot: [0, PI / 2, 0] as [number, number, number] },
  east: { x: DERIVED.halfW - T - OFF, rot: [0, -PI / 2, 0] as [number, number, number] },

  /** 1F 중앙 자립 전시벽 — 입구에서 정면으로 보이는 벽 */
  center1Front: {
    z: CENTER_WALL.floor1Z + T / 2 + OFF,
    rot: [0, 0, 0] as [number, number, number],
  },
  center1Back: {
    z: CENTER_WALL.floor1Z - T / 2 - OFF,
    rot: [0, PI, 0] as [number, number, number],
  },

  /** 2F 중앙 자립 전시벽 */
  center2Front: {
    z: CENTER_WALL.floor2Z + T / 2 + OFF,
    rot: [0, 0, 0] as [number, number, number],
  },
  center2Back: {
    z: CENTER_WALL.floor2Z - T / 2 - OFF,
    rot: [0, PI, 0] as [number, number, number],
  },

  /**
   * 계단 옆 벽 (계단을 오르내리며 보이는 면).
   * 계단은 z = 6.8(아래) → z = -4.2(위) 로 올라갑니다.
   * 그 위치의 바닥 높이는 대략 (6.8 - z) / 11 × 4.35 이므로
   * 글씨 y 는 "그 값 + 1.7" 정도로 잡으면 눈높이에 맞습니다.
   */
  stairInner: { x: CONFIG.stairs.xMin + 0.02, rot: [0, PI / 2, 0] as [number, number, number] },
}

/**
 * 작품이 걸리는 기준 높이 (작품의 세로 중심선).
 * 크기가 달라도 중심선을 맞춰 두면 벽이 정돈되어 보입니다.
 * 개별 작품만 다르게 하고 싶으면 그 항목의 position y 만 바꾸세요.
 */
const Y1 = 2.0 // 1F 작품
const Y2 = 6.6 // 2F 작품
const T1 = 2.1 // 1F 벽 글씨
const T2 = 6.7 // 2F 벽 글씨

const img = (n: string) => `/images/project-${n}.jpg`

export const exhibits: Exhibit[] = [
  /* ══════════════════════════════════════════════════════
     1F — ENTRANCE / MAIN EXHIBITION
     입구는 남쪽, 북쪽을 바라보며 시작합니다.
     ══════════════════════════════════════════════════════ */

  // ── 입장하면 정면으로 보이는 중앙 벽 = YouTube 스크린 ──
  {
    id: 'film-01',
    type: 'youtube',
    title: 'FILM 01',
    // ← 전체 URL 이 아니라 영상 ID 만 넣습니다.
    //    youtu.be/YLk1BQj055g?si=... → 'YLk1BQj055g'
    youtubeId: 'YLk1BQj055g',
    floor: 1,
    position: [0, 1.95, WALL.center1Front.z],
    rotation: WALL.center1Front.rot,
    year: '2026',
    description: 'Moving image work. Replace youtubeId in src/data/exhibits.ts',
  },

  // ── 북쪽 벽 ── 이미지 · 글 · 이미지 · 이미지
  {
    id: 'project-01',
    type: 'image',
    title: 'PROJECT 01',
    image: img('01'),
    floor: 1,
    position: [-6.2, Y1, WALL.north.z],
    rotation: WALL.north.rot,
    scale: 1.0,
    year: '2026',
    captionTop: ['2026', 'PROJECT 01'],
    captionBottom: ['GRAPHIC IDENTITY'],
  },
  {
    id: 'note-01',
    type: 'text',
    title: 'NOTE',
    floor: 1,
    position: [-2.6, T1, WALL.north.z],
    rotation: WALL.north.rot,
    heading: '01 — 04',
    body: ['Graphic identity and print.', '2024 — 2026'],
    textWidth: 2.6,
  },
  {
    id: 'project-05',
    type: 'image',
    title: 'PROJECT 05',
    image: img('05'),
    floor: 1,
    position: [2.2, Y1, WALL.north.z],
    rotation: WALL.north.rot,
    scale: 1.05,
    year: '2026',
    captionTop: ['2025', 'PROJECT 05'],
    captionBottom: ['MOTION'],
  },
  {
    id: 'project-02',
    type: 'image',
    title: 'PROJECT 02',
    image: img('02'),
    floor: 1,
    position: [6.6, Y1, WALL.north.z],
    rotation: WALL.north.rot,
    scale: 0.8,
    year: '2026',
    captionTop: ['2024', 'PROJECT 02'],
  },

  // ── 서쪽 긴 벽 ── 글 · 이미지 · 글 · 이미지 · 이미지
  {
    id: 'statement-01',
    type: 'text',
    title: 'STATEMENT',
    floor: 1,
    position: [WALL.west.x, T1, 9.0],
    rotation: WALL.west.rot,
    heading: 'RUNNING GEAR',
    // 배열 한 칸 = 한 줄. 줄을 바꾸려면 따옴표를 닫고 새 항목을 추가하세요.
    body: [
      'Built to keep you moving.',
      '더 오래, 더 편안하게 달릴 수 있도록',
      '',
      '2026 — DIGITAL VISUAL SHOWROOM',
    ],
    textWidth: 4.6,
  },
  {
    id: 'project-03',
    type: 'image',
    title: 'PROJECT 03',
    image: img('03'),
    floor: 1,
    position: [WALL.west.x, Y1, 4.4],
    rotation: WALL.west.rot,
    scale: 1.2,
    year: '2026',
    captionTop: ['2026', 'PROJECT 03'],
  },
  {
    id: 'note-02',
    type: 'text',
    title: 'NOTE',
    floor: 1,
    position: [WALL.west.x, T1, 0.6],
    rotation: WALL.west.rot,
    heading: 'WEST WALL',
    body: ['Printed matter, mostly.'],
    textWidth: 2.8,
  },
  {
    id: 'project-04',
    type: 'image',
    title: 'PROJECT 04',
    image: img('04'),
    floor: 1,
    position: [WALL.west.x, Y1, -3.0],
    rotation: WALL.west.rot,
    scale: 0.9,
    year: '2026',
    captionTop: ['2025', 'PROJECT 04'],
  },
  {
    id: 'project-06',
    type: 'image',
    title: 'PROJECT 06',
    image: img('06'),
    floor: 1,
    position: [WALL.west.x, Y1, -7.6],
    rotation: WALL.west.rot,
    scale: 1.15,
    year: '2026',
    captionTop: ['2025', 'PROJECT 06'],
    captionBottom: ['BRAND EXPERIENCE', 'Reddot Winner'],
  },

  // ── 동쪽 벽 (계단 구간은 비움) ── 글 · 이미지
  {
    id: 'note-03',
    type: 'text',
    title: 'NOTE',
    floor: 1,
    position: [WALL.east.x, T1, -10.0],
    rotation: WALL.east.rot,
    heading: 'EAST WING',
    body: ['Moving image and installation.'],
    textWidth: 3.0,
  },
  {
    id: 'project-07',
    type: 'image',
    title: 'PROJECT 07',
    image: img('07'),
    floor: 1,
    position: [WALL.east.x, Y1, -6.0],
    rotation: WALL.east.rot,
    scale: 0.95,
    year: '2026',
    captionTop: ['2024', 'PROJECT 07'],
  },

  // ── 계단 벽 ── 오르내리며 읽히는 글씨
  {
    id: 'stair-01',
    type: 'text',
    title: 'STAIR',
    floor: 1,
    position: [WALL.stairInner.x, 3.1, 3.2],
    rotation: WALL.stairInner.rot,
    heading: 'UP TO 02F',
    body: ['Quiet gallery.', 'Studies and moving image.'],
    textWidth: 3.4,
  },
  {
    id: 'stair-02',
    type: 'text',
    title: 'STAIR',
    floor: 1,
    position: [WALL.stairInner.x, 4.8, -1.6],
    rotation: WALL.stairInner.rot,
    heading: 'KEEP WALKING',
    body: ['Ten more steps.'],
    textWidth: 3.2,
  },

  // ── 중앙 전시벽 뒷면 ──
  {
    id: 'index-01',
    type: 'text',
    title: 'INDEX',
    floor: 1,
    position: [0, T1, WALL.center1Back.z],
    rotation: WALL.center1Back.rot,
    heading: 'INDEX / 01F',
    body: ['01   PROJECT 01', '02   PROJECT 05', '03   FILM 01'],
    textWidth: 3.2,
  },

  // ── 남쪽(입구) 벽 ── 글 · 이미지
  {
    id: 'logo-01',
    type: 'image',
    title: 'SAF',
    // 흰 배경 + 검은 글자 로고 파일을 넣으면 흰 글씨로 벽에 붙습니다.
    // 파일 위치: public/images/logo.png
    image: '/images/logo.png',
    mode: 'logo',
    floor: 1,
    position: [-1.5, 2.5, WALL.south.z],
    rotation: WALL.south.rot,
    scale: 1.1,
  },

  /* ══════════════════════════════════════════════════════
     2F — QUIET GALLERY
     ══════════════════════════════════════════════════════ */

  // ── 북쪽 벽 ── 이미지 · 글 · 이미지
  {
    id: 'project-08',
    type: 'image',
    title: 'PROJECT 08',
    image: img('08'),
    floor: 2,
    position: [-5.0, Y2, WALL.north.z],
    rotation: WALL.north.rot,
    scale: 1.1,
    year: '2026',
    captionTop: ['2026', 'PROJECT 08'],
    captionBottom: ['STUDY'],
  },
  {
    id: 'note-04',
    type: 'text',
    title: 'NOTE',
    floor: 2,
    position: [-1.0, T2, WALL.north.z],
    rotation: WALL.north.rot,
    heading: 'UPPER',
    body: ['Studies, sketches, unfinished work.'],
    textWidth: 3.0,
  },
  {
    id: 'project-09',
    type: 'image',
    title: 'PROJECT 09',
    image: img('09'),
    floor: 2,
    position: [3.4, Y2, WALL.north.z],
    rotation: WALL.north.rot,
    scale: 1.05,
    year: '2026',
    captionTop: ['2025', 'PROJECT 09'],
  },

  // ── 서쪽 긴 벽 ── 이미지 · 글 · 이미지 · 이미지
  {
    id: 'project-10',
    type: 'image',
    title: 'PROJECT 10',
    image: img('10'),
    floor: 2,
    position: [WALL.west.x, Y2, -7.0],
    rotation: WALL.west.rot,
    scale: 0.95,
    year: '2026',
    captionTop: ['2026', 'PROJECT 10'],
    captionBottom: ['TYPE DESIGN'],
  },
  {
    id: 'statement-02',
    type: 'text',
    title: 'STATEMENT',
    floor: 2,
    position: [WALL.west.x, T2, -1.5],
    rotation: WALL.west.rot,
    heading: 'ON PROCESS',
    body: [
      'Most of this work never left the studio.',
      'It is here because the process mattered.',
    ],
    textWidth: 4.4,
  },
  {
    id: 'project-11',
    type: 'image',
    title: 'PROJECT 11',
    image: img('11'),
    floor: 2,
    position: [WALL.west.x, Y2, 3.5],
    rotation: WALL.west.rot,
    scale: 1.0,
    year: '2026',
    captionTop: ['2025', 'PROJECT 11'],
  },
  {
    id: 'project-12',
    type: 'image',
    title: 'PROJECT 12',
    image: img('12'),
    floor: 2,
    position: [WALL.west.x, Y2, 8.6],
    rotation: WALL.west.rot,
    scale: 0.85,
    year: '2026',
    captionTop: ['2024', 'PROJECT 12'],
    captionBottom: ['ARCHIVE'],
  },

  // ── 2F 중앙 전시벽 ──
  {
    id: 'statement-03',
    type: 'text',
    title: 'STATEMENT 02',
    floor: 2,
    position: [0, T2, WALL.center2Front.z],
    rotation: WALL.center2Front.rot,
    heading: '02F',
    body: ['The upper floor is quieter.', 'Fewer works, more distance between them.'],
    textWidth: 4.4,
    align: 'center',
    rule: false,
  },

  // ── 남쪽 벽 ──
  {
    id: 'note-05',
    type: 'text',
    title: 'NOTE',
    floor: 2,
    position: [2.0, T2, WALL.south.z],
    rotation: WALL.south.rot,
    heading: 'END',
    body: ['Take the stairs back down.', 'Thank you for walking through.'],
    textWidth: 3.6,
  },
]
