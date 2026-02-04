import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function VaporwaveElements() {
    const pyramidsRef = useRef<THREE.Group>(null)

    // Animate floating pyramids
    useFrame((state) => {
        if (pyramidsRef.current) {
            pyramidsRef.current.children.forEach((child, i) => {
                child.position.y = 15 + Math.sin(state.clock.elapsedTime + i) * 2
                child.rotation.y += 0.005
            })
        }
    })

    return (
        <group>
            {/* LOW-POLY PALM TREES */}
            {[-80, -40, 40, 80].map((x, i) => (
                <group key={`palm-${i}`} position={[x, 0, -50 - i * 80]}>
                    {/* Trunk */}
                    <mesh position={[0, 8, 0]}>
                        <cylinderGeometry args={[0.8, 1.2, 16, 6]} />
                        <meshStandardMaterial color="#3d2817" roughness={0.9} />
                    </mesh>
                    {/* Leaves - 6 cones in circle */}
                    {[0, 60, 120, 180, 240, 300].map((angle, j) => {
                        const rad = (angle * Math.PI) / 180
                        return (
                            <mesh
                                key={j}
                                position={[Math.cos(rad) * 2, 16, Math.sin(rad) * 2]}
                                rotation={[Math.PI / 4, 0, rad]}
                            >
                                <coneGeometry args={[1.5, 8, 4]} />
                                <meshStandardMaterial color="#00ff88" flatShading />
                            </mesh>
                        )
                    })}
                </group>
            ))}

            {/* FLOATING WIREFRAME PYRAMIDS */}
            <group ref={pyramidsRef}>
                {[
                    { pos: [-30, 15, -100], size: 4, color: '#00ffff' },
                    { pos: [35, 18, -150], size: 6, color: '#ff00ff' },
                    { pos: [-45, 12, -200], size: 5, color: '#ffaa00' }
                ].map((pyr, i) => (
                    <mesh
                        key={i}
                        position={pyr.pos as [number, number, number]}
                        rotation={[0, Math.PI / 4, 0]}
                    >
                        <octahedronGeometry args={[pyr.size, 0]} />
                        <meshBasicMaterial color={pyr.color} wireframe />
                    </mesh>
                ))}
            </group>

            {/* CHROME SPHERES */}
            {[
                { pos: [-60, 5, -80], size: 3 },
                { pos: [55, 4, -120], size: 2.5 },
                { pos: [-50, 6, -180], size: 4 }
            ].map((sphere, i) => (
                <mesh key={`sphere-${i}`} position={sphere.pos as [number, number, number]}>
                    <sphereGeometry args={[sphere.size, 16, 16]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        metalness={1}
                        roughness={0.1}
                        envMapIntensity={2}
                    />
                </mesh>
            ))}
        </group>
    )
}
