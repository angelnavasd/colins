import * as THREE from 'three'
import React, { forwardRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import type { ThreeElements } from '@react-three/fiber'

type GLTFResult = GLTF & {
  nodes: {
    Lamborghini_Aventador_Body: THREE.Mesh
    Lamborghini_Aventador_Glass: THREE.Mesh
    Lamborghini_Aventador_Wheel_FL: THREE.Mesh
    Lamborghini_Aventador_Wheel_FR: THREE.Mesh
    Lamborghini_Aventador_Wheel_RL: THREE.Mesh
    Lamborghini_Aventador_Wheel_RR: THREE.Mesh
  }
  materials: {
    _Lamborghini_AventadorLamborghini_Aventador_BodySG: THREE.MeshStandardMaterial
    _Lamborghini_AventadorLamborghini_Aventador_GlassSG: THREE.MeshStandardMaterial
  }
}

type ModelProps = ThreeElements['group'] & {
  wheelRefs?: {
    fl: React.RefObject<THREE.Group | null>
    fr: React.RefObject<THREE.Group | null>
    rl: React.RefObject<THREE.Group | null>
    rr: React.RefObject<THREE.Group | null>
  }
}

export const LamborghiniModel = forwardRef<THREE.Group, ModelProps>((props, ref) => {
  const { wheelRefs, ...rest } = props
  const { nodes, materials } = useGLTF('/models/lamborghini_aventador.glb') as unknown as GLTFResult

  // Calculate wheel centers for correct rotation pivot
  const centers = useMemo(() => {
    if (!nodes) return null
    const getCenter = (mesh: THREE.Mesh) => {
      mesh.geometry.computeBoundingBox()
      const center = new THREE.Vector3()
      mesh.geometry.boundingBox?.getCenter(center)
      return center
    }
    return {
      fl: getCenter(nodes.Lamborghini_Aventador_Wheel_FL),
      fr: getCenter(nodes.Lamborghini_Aventador_Wheel_FR),
      rl: getCenter(nodes.Lamborghini_Aventador_Wheel_RL),
      rr: getCenter(nodes.Lamborghini_Aventador_Wheel_RR),
    }
  }, [nodes])

  if (!centers) return null

  return (
    <group ref={ref} {...rest} dispose={null}>
      <mesh geometry={nodes.Lamborghini_Aventador_Body.geometry} material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG} />
      <mesh geometry={nodes.Lamborghini_Aventador_Glass.geometry} material={materials._Lamborghini_AventadorLamborghini_Aventador_GlassSG} />
      {/* Wheels wrapped in groups at their centers, meshes offset to rotate around pivot */}
      <group position={centers.fl} ref={wheelRefs?.fl}>
        <mesh
          geometry={nodes.Lamborghini_Aventador_Wheel_FL.geometry}
          material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
          position={[-centers.fl.x, -centers.fl.y, -centers.fl.z]}
        />
      </group>
      <group position={centers.fr} ref={wheelRefs?.fr}>
        <mesh
          geometry={nodes.Lamborghini_Aventador_Wheel_FR.geometry}
          material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
          position={[-centers.fr.x, -centers.fr.y, -centers.fr.z]}
        />
      </group>
      <group position={centers.rl} ref={wheelRefs?.rl}>
        <mesh
          geometry={nodes.Lamborghini_Aventador_Wheel_RL.geometry}
          material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
          position={[-centers.rl.x, -centers.rl.y, -centers.rl.z]}
        />
      </group>
      <group position={centers.rr} ref={wheelRefs?.rr}>
        <mesh
          geometry={nodes.Lamborghini_Aventador_Wheel_RR.geometry}
          material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
          position={[-centers.rr.x, -centers.rr.y, -centers.rr.z]}
        />
      </group>
    </group>
  )
})

useGLTF.preload('/models/lamborghini_aventador.glb')
