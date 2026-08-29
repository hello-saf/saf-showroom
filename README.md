# SHOWROOM — 3D Interactive Online Visual Showroom

2층 규모의 온라인 3D 비주얼 쇼룸. Vite + React + TypeScript + Three.js (React Three Fiber).

## 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다.

프로덕션 빌드:

```bash
npm run build
```

## 조작

| 입력 | 동작 |
| --- | --- |
| `W A S D` | 이동 |
| `SHIFT` | 조금 빠르게 걷기 |
| 마우스 | 시점 회전 (클릭하면 pointer lock) |
| `Q` / `E` | 키보드로 좌우 회전 |
| 클릭 | 가까운 작품 열기 |
| `ESC` | pointer lock 해제 / 오버레이 닫기 |

## 이미지 넣기

`public/images/` 에 `project-01.jpg` ~ `project-13.jpg` 를 넣으면 자동으로 벽에 붙습니다.
파일이 없으면 미니멀한 placeholder 가 대신 표시됩니다.

**비율은 항상 원본 그대로 유지됩니다.** 16:9, 4:3, 1:1, 3:4, 9:16 무엇을 넣어도
잘리거나 늘어나지 않고, 정해진 박스 안에 들어가도록 크기만 줄어듭니다.

- 기준 박스 크기: `showroomConfig.ts` 의 `display.maxWidth` / `display.maxHeight`
- 작품별 크기: `exhibits.ts` 각 항목의 `scale` (0.7 작게 / 1.4 크게)

## 로고 넣기

입구 왼쪽(남쪽) 벽에 로고 자리가 있습니다. `public/images/logo.png` 에 파일을 넣으면 됩니다.

**흰 배경 + 검은 글자** 이미지를 넣으면 자동으로 배경을 지우고 **흰 글씨**로 벽에 인쇄된 것처럼
표시됩니다 (`exhibits.ts` 의 `mode: 'logo'` 가 하는 일). 파일이 없으면 아무것도 그리지 않고
콘솔에 안내만 남깁니다.

이미 흰 글자 + 투명 배경 PNG 라면 `mode: 'logo'` 를 지우고 일반 이미지로 쓰세요.
크기는 `scale`, 위치는 `position` 으로 조절합니다.

## 어떤 파일을 고치면 되는가

| 파일 | 역할 |
| --- | --- |
| `src/config/showroomConfig.ts` | **공간 전체 설정.** 방 크기, 층높이, 걷기 속도, 카메라 높이, 마우스 감도, 색상, 조명 밝기, 바닥 반사, 작품 최대 크기, 캡션 서체 |
| `src/data/exhibits.ts` | **작품 추가 / 위치 / 크기 / 캡션 / 벽 텍스트 / YouTube ID** |
| `src/scene/layout.ts` | 벽·계단·바닥·LED 라인의 실제 배치 (여기를 고치면 충돌도 같이 바뀝니다) |
| `src/scene/Architecture.tsx` | 건축 구조 렌더링, 바닥 반사 재질 |
| `src/scene/Lighting.tsx` | 천장 매입 스팟 위치, LED 워시 조명 |
| `src/scene/Materials.ts` | 벽/바닥/금속 등 재질의 거칠기·메탈니스 |
| `src/scene/textTexture.ts` | 벽 글씨와 캡션을 캔버스에 그리는 공용 함수 |
| `src/components/Display.tsx` | 이미지 전시 (액자 없음, 위/아래 캡션) |
| `src/components/TextPanel.tsx` | 벽에 적히는 큰 글씨 |
| `src/components/VideoDisplay.tsx` | YouTube 스크린 |
| `src/components/FirstPersonController.tsx` | 1인칭 이동 / 마우스 시점 / 충돌 |
| `src/components/HUD.tsx` | 화면 UI 배치 (코너 마크, 키 안내) |
| `src/components/Minimap.tsx` | 좌측 하단 미니맵 + 나침반 |
| `src/components/Compass.tsx` | 하단 중앙 방위 리본 |
| `src/styles.css` | Splash, 로딩, HUD, 오버레이 디자인 (상단 `:root` 변수에서 일괄 조절) |

## 전시물 세 가지 타입

`exhibits.ts` 의 `type` 으로 정합니다.

```ts
// 1. 벽에 붙는 이미지 (위/아래 캡션 선택)
{ id: 'project-01', type: 'image', image: img('01'),
  position: [-6, 1.9, WALL.north.z], rotation: WALL.north.rot,
  scale: 0.85,
  captionTop: ['2026', 'PROJECT 01'],
  captionBottom: ['GRAPHIC IDENTITY'] }

// 2. 이미지 없이 벽에 직접 적히는 글씨
{ id: 'note-01', type: 'text',
  position: [6.2, 2.1, WALL.north.z], rotation: WALL.north.rot,
  heading: '01 — 04',
  body: ['Graphic identity and print.', '2024 — 2026'],
  textWidth: 2.8 }

// 3. 실제로 재생되는 YouTube 스크린
{ id: 'film-01', type: 'youtube', youtubeId: 'M7lc1UVf-VE',
  position: [0, 1.95, WALL.center1Front.z], rotation: WALL.center1Front.rot }
```

벽 좌표는 `WALL` 상수를 쓰면 항상 벽 표면에 정확히 붙습니다.
`WALL.north` / `south` / `west` / `east` / `center1Front` / `center1Back` /
`center2Front` / `center2Back` / `stairInner` (계단 벽).

## 자주 하는 수정

**전체를 더 밝게 / 어둡게** — `showroomConfig.ts` 의 `lights.exposure`
(0.8 어둡게 / 1.1 현재 / 1.6 밝게)

**바닥 빛 번짐 줄이기** — `reflection.mixStrength` 를 낮춤 (0 이면 반사 없음).
번진 빛이 늘어져 보이면 `reflection.blur` 와 `depthScale` 을 낮춤.

**벽 색** — `colors.wall`

**걷기 속도 / 달리기 배율** — `player.speed`, `player.runMultiplier`

**HUD 여백** — `styles.css` 의 `--hud-gap` (미니맵·나침반·키 안내가 함께 움직임)

**HUD 강조색** — `styles.css` 의 `--hud-accent`

**기둥 다시 세우기** — `layout.ts` 의 `COLUMNS` 배열에 한 줄 추가

**Splash 를 흰 배경으로** — `styles.css` 상단 `--splash-bg` / `--splash-fg` 등 4줄

## 개발 편의 (dev 모드 전용)

브라우저 콘솔에서 원하는 위치로 즉시 이동할 수 있습니다.
작품 좌표를 조정할 때 걸어가지 않고 바로 확인할 때 씁니다.

```js
goto(x, z, yawRad, feetY)

goto(-6, 9.5, Math.PI / 2)        // 1F 서쪽 벽 앞
goto(0, -8, 0, 4.65)              // 2F 북쪽 벽 앞
goto(8.7, 3.2, Math.PI / 2, 1.6)  // 계단 중간
```

`yawRad` — 0 북쪽 / `Math.PI/2` 서쪽 / `-Math.PI/2` 동쪽 / `Math.PI` 남쪽
`feetY` — 1F 는 0, 2F 는 4.65, 계단 중간은 대략 `(6.8 - z) / 11 * 4.65`

## 구조 메모

- 외부 3D 모델 파일 없이 모든 건축 요소를 코드로 생성합니다.
- 충돌은 원 vs AABB 방식이며 `layout.ts` 의 `COLLIDERS` 에서 자동 생성됩니다.
- 계단은 경사면(`groundHeightAt`)으로 처리해 자연스럽게 올라갑니다.
- YouTube 는 실제 iframe 이며, 벽 뒤에 있을 때는 자동으로 숨겨집니다.
- 백엔드 / DB / 로그인 없음. 모든 콘텐츠는 로컬 파일 기반입니다.
