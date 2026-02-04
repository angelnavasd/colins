import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SEGMENT_SIZE = 20
const SEGMENT_COUNT = 15
const TOTAL_LENGTH = SEGMENT_SIZE * SEGMENT_COUNT

export function InfiniteRoad() {
    const groupsRef = useRef<(THREE.Group | null)[]>([])
    const worldPos = useMemo(() => new THREE.Vector3(), [])

    // Base ground material (dark purple - the sides)
    const groundMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#0a0012',
            roughness: 0.9,
            metalness: 0
        })
    }, [])

    // Actual road surface material (asphalt with white lane markings)
    const roadMaterial = useMemo(() => {
        const size = 512
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!

        // Dark asphalt base
        ctx.fillStyle = '#1a1a20'
        ctx.fillRect(0, 0, size, size)

        // Subtle texture noise
        ctx.fillStyle = '#141418'
        for (let i = 0; i < 400; i++) {
            ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2)
        }

        // White edge lines
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.moveTo(12, 0)
        ctx.lineTo(12, size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(size - 12, 0)
        ctx.lineTo(size - 12, size)
        ctx.stroke()

        // White dashed center line
        ctx.setLineDash([40, 60])
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(size / 2, 0)
        ctx.lineTo(size / 2, size)
        ctx.stroke()
        ctx.setLineDash([])

        const tex = new THREE.CanvasTexture(canvas)
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(1, 12)
        tex.anisotropy = 16

        return new THREE.MeshStandardMaterial({
            map: tex,
            color: '#ffffff', // WHITE so texture shows through!
            roughness: 0.6,
            metalness: 0.05,
            emissive: '#ffffff',
            emissiveMap: tex,
            emissiveIntensity: 0.3 // Lines glow slightly
        })
    }, [])

    useFrame(() => {
        groupsRef.current.forEach((group) => {
            if (!group) return
            group.getWorldPosition(worldPos)
            if (worldPos.z > 20) {
                group.position.z -= TOTAL_LENGTH
            }
        })
    })

    return (
        <group>
            {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
                <group
                    key={i}
                    ref={(el) => (groupsRef.current[i] = el)}
                    position={[0, 0, -i * SEGMENT_SIZE]}
                >
                    {/* BASE GROUND - Dark purple sides */}
                    <mesh
                        position={[0, -0.02, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        material={groundMaterial}
                        name="Terrain"
                    >
                        <planeGeometry args={[300, SEGMENT_SIZE]} />
                    </mesh>

                    {/* ACTUAL ROAD SURFACE - Asphalt with white lines */}
                    <mesh
                        position={[0, 0, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        material={roadMaterial}
                    >
                        <planeGeometry args={[30, SEGMENT_SIZE]} />
                    </mesh>

                    {/* NEON EDGE BARRIERS */}
                    <mesh position={[-15, 0.2, 0]}>
                        <boxGeometry args={[0.4, 0.4, SEGMENT_SIZE]} />
                        <meshBasicMaterial color="#00ffff" />
                    </mesh>
                    <mesh position={[15, 0.2, 0]}>
                        <boxGeometry args={[0.4, 0.4, SEGMENT_SIZE]} />
                        <meshBasicMaterial color="#ff00ff" />
                    </mesh>
                </group>
            ))}
        </group>
    )
}
