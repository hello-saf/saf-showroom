/**
 * 공용 재질 — 한 번만 생성해서 모든 mesh가 재사용합니다.
 * 색상은 showroomConfig.ts 의 colors 에서 관리합니다.
 */

import * as THREE from 'three'
import { CONFIG } from '../config/showroomConfig'

const { colors, lights } = CONFIG

export const MATERIALS = {
  wall: new THREE.MeshStandardMaterial({
    color: colors.wall,
    roughness: 0.82,
    metalness: 0.05,
  }),
  ceiling: new THREE.MeshStandardMaterial({
    color: colors.ceiling,
    roughness: 0.95,
    metalness: 0,
  }),
  floor: new THREE.MeshStandardMaterial({
    color: colors.floor,
    roughness: 0.22,
    metalness: 0.5,
  }),
  wood: new THREE.MeshStandardMaterial({
    color: colors.wood,
    roughness: 0.6,
    metalness: 0.15,
  }),
  metal: new THREE.MeshStandardMaterial({
    color: colors.metal,
    roughness: 0.28,
    metalness: 0.9,
  }),
  column: new THREE.MeshStandardMaterial({
    color: colors.column,
    roughness: 0.75,
    metalness: 0.1,
  }),
  frame: new THREE.MeshStandardMaterial({
    color: colors.frame,
    roughness: 0.4,
    metalness: 0.35,
  }),
  matte: new THREE.MeshStandardMaterial({
    color: colors.matte,
    roughness: 1,
    metalness: 0,
  }),
  /** LED 라인 — 실제 빛을 내지 않는 emissive 재질 (빛은 Lighting.tsx 가 담당) */
  led: new THREE.MeshBasicMaterial({ color: colors.led }),
  ledSoft: new THREE.MeshStandardMaterial({
    color: '#000000',
    emissive: colors.led,
    emissiveIntensity: lights.ledEmissive,
  }),
} as const

/** 반복 사용하는 단위 지오메트리 */
export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1)
export const UNIT_PLANE = new THREE.PlaneGeometry(1, 1)
export const UNIT_CIRCLE = new THREE.CircleGeometry(0.5, 20)
