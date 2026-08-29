/**
 * ============================================================
 *  SHOWROOM CONFIG
 *  -----------------------------------------------------------
 *  이 파일의 숫자만 바꾸면 공간 전체에 반영됩니다.
 *  단위: meter
 * ============================================================
 */

export const CONFIG = {
  /** 건물 크기 */
  room: {
    width: 17, //          X axis (좌우)
    depth: 24, //          Z axis (앞뒤)
    floorHeight: 4.5, //   1F 천장 높이 (= 2F 슬래브 아래면)
    slabThickness: 0.15, // 2F 바닥 슬래브 두께
    totalHeight: 9.3, //   2F 천장 높이
    wallThickness: 0.3,
  },

  /** 계단 (동쪽 벽을 따라 1F → 2F 직선 계단) */
  stairs: {
    xMin: 5.9, //     계단 서쪽 경계 (계단 옆 벽 위치)
    xMax: 8.5, //     계단 동쪽 경계 (외벽 = room.width / 2)
    zBottom: 6.8, //  계단 시작 (1F, 남쪽)
    zTop: -4.2, //    계단 끝 (2F 도착, 북쪽)
    steps: 24, //     시각적 계단 수
  },

  /** 플레이어 */
  player: {
    speed: 2.6, //          걷기 속도 (m/s) — 게임보다 느리게
    runMultiplier: 1.8, //  Shift 를 누르고 있을 때의 속도 배율
    cameraHeight: 1.68, //  눈 높이
    radius: 0.35, //        충돌 반경
    mouseSensitivity: 0.0018, // 낮출수록 시점이 천천히 돌아갑니다
    keyTurnSpeed: 1.6, //       Q / E 키로 좌우 회전하는 속도 (rad/s)
    gravity: 18,
    stepTolerance: 0.55, // 이 높이 이하의 단차는 걸어 올라감 (계단용)
    /**
     * 시작 위치와 방향.
     * yaw: 0 = 북쪽 / Math.PI/2 = 서쪽 / Math.PI = 남쪽 / -Math.PI/2 = 동쪽
     * 지금은 입구 안쪽에서 서쪽을 바라보며 시작합니다.
     * (왼쪽에 로고 벽, 정면 오른쪽에 서쪽 갤러리가 보이는 구도)
     */
    spawn: { x: 3.5, z: 9.4, yaw: Math.PI / 2 },
  },

  /** 이미지 디스플레이 */
  display: {
    /**
     * 크기 계산 방식 (원본 비율은 어느 쪽이든 항상 유지됩니다)
     *   'area' — 넓이를 기준으로 맞춥니다. 세로 사진과 가로 사진이
     *            비슷한 크기감으로 보여서 여러 비율이 섞여 있을 때 좋습니다. (권장)
     *   'box'  — maxWidth × maxHeight 박스 안에 들어가게 맞춥니다.
     *            모든 작품의 높이(또는 폭)를 딱 맞추고 싶을 때 씁니다.
     */
    fit: 'area' as 'area' | 'box',
    /** fit: 'area' 일 때의 기준 넓이 (m²). 키우면 작품이 전체적으로 커집니다. */
    targetArea: 5.2,

    /**
     * 최대 크기 (m). scale 과 무관한 절대 한계입니다.
     * 천장 높이와 캡션 자리를 고려한 값이라, 여기를 넘으면
     * 비율을 유지한 채 자동으로 줄어듭니다.
     */
    maxWidth: 3.8,
    maxHeight: 3.1,
    /** 액자 없이 벽에서 살짝 띄우는 거리 (z-fighting 방지) */
    wallOffset: 0.014,
    emissive: 0.75, //  작품 자체 발광 (0 = 조명에만 의존, 1 이상 = 백라이트 느낌)
    interactionDistance: 3.0, // 이 거리 안에서 VIEW 프롬프트 표시

    /** 작품 위/아래에 붙는 작은 캡션 (exhibits.ts 의 captionTop / captionBottom) */
    captionSize: 0.085, //        글자 높이 (m)
    captionWeightFirst: 600, //   첫 줄 굵기
    captionWeight: 400, //        나머지 줄 굵기
    captionTracking: 0.016, //    자간 (m)
    captionLineGap: 0.075, //     줄 간격 (m) — 키우면 줄 사이가 넓어집니다
    captionGap: 0.16, //          이미지와 캡션 사이 간격 (m)
    captionAlign: 'left' as const,
    captionColor: '#f2efe9',
    captionColorMuted: 'rgba(242, 239, 233, 0.45)',
  },

  /** 비디오 스크린 */
  video: {
    screenWidth: 4.2, //     16:9 로 높이 자동 계산
    frameDepth: 0.1,
    activeDistance: 19, //   이 거리 안에 들어오면 실제 YouTube 재생 시작
    //                       (입장 시점부터 바로 재생되도록 넉넉하게)
  },

  /**
   * 벽에 직접 적히는 텍스트 (type: 'text' 전시물)
   * 단위는 meter — 숫자를 키우면 벽의 글씨가 커집니다.
   */
  text: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    defaultWidth: 4.2, //     패널 기본 가로 폭
    padding: 0.16,
    headingSize: 0.34, //     큰 제목 글자 높이
    headingWeight: 600,
    headingTracking: 0.03, // 자간
    headingColor: '#f2efe9',
    headingGap: 0.42, //      제목 아래 여백
    bodySize: 0.115, //       본문 글자 높이
    bodyWeight: 400,
    bodyTracking: 0.018,
    bodyColor: 'rgba(242, 239, 233, 0.6)',
    lineGap: 0.16, //         본문 줄 간격 (키우면 줄 사이가 넓어집니다)
    ruleWidth: 0.5, //        제목 위 짧은 선 길이
  },

  /** 색상 — dark editorial gallery */
  colors: {
    wall: '#3a3d42', //      charcoal wall (밝게 하려면 값을 올리세요)
    ceiling: '#1d1f22', //   dark ceiling
    floor: '#16181a', //     dark glossy floor
    wood: '#35383c', //      계단
    metal: '#71767d', //     난간
    column: '#42454a',
    frame: '#0a0a0b', //     디스플레이 프레임
    matte: '#111214', //     디스플레이 매트
    background: '#000000', //  캔버스 배경 (black)
    led: '#ffffff', //       LED 라인 조명
  },

  /**
   * 조명
   * ── 공간 전체를 밝게/어둡게 하려면 exposure 하나만 조절하면 됩니다.
   *    0.8 = 어둡게 / 1.3 = 기본 / 1.8 = 밝게
   */
  lights: {
    exposure: 1.1,

    ambientIntensity: 0.55, //   전체 베이스 밝기
    ambientColor: '#bcc5d2',

    /** 천장 매입 스팟 */
    spotIntensity: 80,
    spotColor: '#fff4e6',
    spotAngle: 0.75,
    spotPenumbra: 0.9,

    /** 바닥 LED 라인 주변 워시 */
    ledIntensity: 9,
    ledColor: '#dfe9f7',
    ledDistance: 16,

    /** LED 스트립 자체의 밝기 */
    ledEmissive: 3.2,
  },

  /**
   * 바닥 반사
   * ── 바닥의 빛 번짐이 거슬리면 mixStrength 를 낮추세요 (0 이면 반사 없음).
   *    번진 빛이 세로로 늘어져 보이면 blur 와 depthScale 을 낮추면 됩니다.
   *    성능이 부족하면 enabled: false.
   */
  reflection: {
    enabled: true,
    resolution: 512, //     낮출수록 빠름
    blur: 220, //           반사상의 흐림 정도 (크면 빛이 길게 번집니다)
    mixStrength: 4.5, //    반사 강도
    mixBlur: 1,
    depthScale: 0.35, //    깊이에 따른 왜곡 (크면 빛이 일그러집니다)
    minDepthThreshold: 0.9,
    maxDepthThreshold: 1.15,
    roughness: 1,
    metalness: 0.3,
  },
} as const

/** 파생 값 — 직접 수정할 필요 없음 */
export const DERIVED = {
  halfW: CONFIG.room.width / 2,
  halfD: CONFIG.room.depth / 2,
  /** 2F 바닥 높이 (걷는 면) */
  floor2Y: CONFIG.room.floorHeight + CONFIG.room.slabThickness,
  /** 계단 전체 길이 / 높이 */
  stairRun: CONFIG.stairs.zBottom - CONFIG.stairs.zTop,
  stairRise: CONFIG.room.floorHeight + CONFIG.room.slabThickness,
}
