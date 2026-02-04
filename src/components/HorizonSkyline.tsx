import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

export function HorizonSkyline() {
    const { scene } = useGLTF('/Blocks Skyline.glb')
    const groupRef = useRef<THREE.Group>(null)

    // Clone the scene to use it multiple times
    const clonedScene = scene.clone()

    return (
        <group ref={groupRef}>
            {/* Main skyline in the distance */}
            <primitive
                object={clonedScene}
                position={[0, 0, -300]}
                scale={[15, 15, 15]}
            />

            {/* Duplicate for left side */}
            <primitive
                object={scene.clone()}
                position={[-200, 0, -250]}
                scale={[12, 12, 12]}
                rotation={[0, Math.PI / 6, 0]}
            />

            {/* Duplicate for right side */}
            <primitive
                object={scene.clone()}
                position={[200, 0, -250]}
                scale={[12, 12, 12]}
                rotation={[0, -Math.PI / 6, 0]}
            />
        </group>
    )
}

// Preload the model
useGLTF.preload('/Blocks Skyline.glb')
