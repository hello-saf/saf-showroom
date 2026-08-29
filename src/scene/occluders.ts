/**
 * 건축 구조물(벽/기둥/슬래브) 그룹에 대한 공용 ref.
 *
 * VideoDisplay 의 YouTube iframe 은 실제 DOM 이라 그냥 두면
 * 벽 뒤에 있어도 화면 위에 비쳐 보입니다.
 * 이 ref 를 drei <Html occlude> 에 넘겨서
 * 사이에 벽이 있으면 iframe 을 감추도록 합니다.
 */

import { createRef } from 'react'
import type * as THREE from 'three'

export const architectureRef = createRef<THREE.Group>()
