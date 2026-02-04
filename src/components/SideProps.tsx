import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CITY_BLOCK_COUNT = 40
const BLOCK_SPACING = 30

export function SideProps() {
    const itemsRef = useRef<(THREE.Group | null)[]>([])
    const worldPos = useMemo(() => new THREE.Vector3(), [])

    // Building material with glowing windows
    const buildingMat = useMemo(() => {
        const size = 128
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!

        // Dark building base
        ctx.fillStyle = '#0a0018'
        ctx.fillRect(0, 0, size, size)

        // Horizontal floor lines (subtle)
        ctx.strokeStyle = '#1a0030'
        ctx.lineWidth = 1
        for (let y = 0; y < size; y += 16) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(size, y)
            ctx.stroke()
        }

        // Random glowing windows (cyan and magenta mix)
        const windowColors = ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88']
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (Math.random() > 0.4) { // 60% chance of window
                    const x = col * 16 + 2
                    const y = row * 16 + 4
                    ctx.fillStyle = windowColors[Math.floor(Math.random() * windowColors.length)]
                    ctx.globalAlpha = 0.5 + Math.random() * 0.5
                    ctx.fillRect(x, y, 10, 8)
                }
            }
        }
        ctx.globalAlpha = 1

        const tex = new THREE.CanvasTexture(canvas)
        tex.magFilter = THREE.NearestFilter
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping

        return new THREE.MeshStandardMaterial({
            map: tex,
            color: '#0a0018',
            roughness: 0.3,
            metalness: 0.6,
            emissive: '#ffffff',
            emissiveMap: tex,
            emissiveIntensity: 1.0
        })
    }, [])

    // Generate random building properties - WIDER GAP from center
    const buildings = useMemo(() => {
        return Array.from({ length: CITY_BLOCK_COUNT }).map((_, i) => ({
            leftHeight: 25 + Math.random() * 70,
            leftWidth: 8 + Math.random() * 15,
            leftDepth: 8 + Math.random() * 15,
            leftOffset: 55 + Math.random() * 30, // Farther from road (was 30+20)
            rightHeight: 25 + Math.random() * 70,
            rightWidth: 8 + Math.random() * 15,
            rightDepth: 8 + Math.random() * 15,
            rightOffset: 55 + Math.random() * 30, // Farther from road
            hasLight: i % 10 === 0
        }))
    }, [])

    useFrame(() => {
        itemsRef.current.forEach((group) => {
            if (!group) return
            group.getWorldPosition(worldPos)
            if (worldPos.z > 20) {
                group.position.z -= CITY_BLOCK_COUNT * BLOCK_SPACING
            }
        })
    })

    return (
        <group>
            {/* GROUND FILL - Sidewalk area between road and buildings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, 0.01, -600]}>
                <planeGeometry args={[50, 1200]} />
                <meshStandardMaterial
                    color="#0a0012"
                    emissive="#1a0030"
                    emissiveIntensity={0.3}
                    flatShading
                />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.01, -600]}>
                <planeGeometry args={[50, 1200]} />
                <meshStandardMaterial
                    color="#0a0012"
                    emissive="#1a0030"
                    emissiveIntensity={0.3}
                    flatShading
                />
            </mesh>

            {buildings.map((props, i) => (
                <group
                    key={i}
                    ref={(el) => (itemsRef.current[i] = el)}
                    position={[0, 0, -i * BLOCK_SPACING]}
                >
                    {/* Left Building - with windows */}
                    <mesh position={[-props.leftOffset, props.leftHeight / 2, 0]}>
                        <boxGeometry args={[props.leftWidth, props.leftHeight, props.leftDepth]} />
                        <primitive object={buildingMat.clone()} attach="material" />
                    </mesh>

                    {/* Right Building */}
                    <mesh position={[props.rightOffset, props.rightHeight / 2, 0]}>
                        <boxGeometry args={[props.rightWidth, props.rightHeight, props.rightDepth]} />
                        <primitive object={buildingMat.clone()} attach="material" />
                    </mesh>

                    {/* Sparse streetlights with warm glow */}
                    {props.hasLight && (
                        <pointLight position={[0, 8, 0]} color="#ffcc66" intensity={20} distance={35} decay={2} />
                    )}
                </group>
            ))}
        </group>
    )
}
