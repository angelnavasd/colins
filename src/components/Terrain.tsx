import { forwardRef, useMemo } from 'react'
import { Group, PlaneGeometry, Float32BufferAttribute } from 'three'

const Terrain = forwardRef<Group>((_props, ref) => {
    // Generate side mountains with PERIODIC noise for seamless looping
    // Loop Length must match CarController (e.g., 400 units)
    const mountainsGeo = useMemo(() => {
        const geo = new PlaneGeometry(250, 2000, 30, 200)
        const pos = geo.attributes.position as Float32BufferAttribute
        const loopLength = 400

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i)
            const z = pos.getZ(i)

            // Mountainous height based on distance from road
            if (Math.abs(x) > 30) {
                const dist = Math.abs(x) - 30

                // Periodic Noise: sin(z * 2PI / loopLength)
                // This ensures z=0 and z=400 have the exact same height
                const frequency = (2 * Math.PI) / loopLength
                const noise = Math.sin(z * frequency) * 10 + Math.cos(z * frequency * 2) * 5

                // Simpler, smoother mountains
                pos.setY(i, Math.max(0, (dist * 0.5) + noise))
            }
        }
        geo.computeVertexNormals()
        return geo
    }, [])

    return (
        <group ref={ref}>
            {/* Dark Asphalt Road */}
            <mesh name="Terrain" receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[50, 2000, 1, 50]} />
                <meshStandardMaterial
                    color="#080810" // Slightly lighter black for visibility
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Neon Border Strips */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-24.8, 0.02, 0]}>
                <planeGeometry args={[0.5, 2000]} />
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24.8, 0.02, 0]}>
                <planeGeometry args={[0.5, 2000]} />
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
            </mesh>

            {/* Subtle Road Grid */}
            <gridHelper
                args={[50, 200, '#4400ff', '#110044']} // Less dense grid
                position={[0, 0.01, 0]}
                rotation={[0, 0, 0]}
            />

            {/* Tiling segments for infinite road feel */}
            <group position={[0, 0, -1000]}>
                <gridHelper args={[50, 200, '#4400ff', '#110044']} position={[0, 0.01, 0]} />
            </group>
            <group position={[0, 0, 1000]}>
                <gridHelper args={[50, 200, '#4400ff', '#110044']} position={[0, 0.01, 0]} />
            </group>

            {/* Left Mountain Silhouettes */}
            <mesh position={[-150, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <primitive object={mountainsGeo} attach="geometry" />
                <meshStandardMaterial
                    color="#050010"
                    wireframe={false}
                />
                <mesh position={[0, 0, 0.1]}>
                    <primitive object={mountainsGeo} attach="geometry" />
                    <meshStandardMaterial
                        color="#aa00ff"
                        wireframe
                        transparent
                        opacity={0.08} // Subtler wireframe
                    />
                </mesh>
            </mesh>

            {/* Right Mountain Silhouettes */}
            <mesh position={[150, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <primitive object={mountainsGeo} attach="geometry" />
                <meshStandardMaterial
                    color="#050010"
                    wireframe={false}
                />
                <mesh position={[0, 0, 0.1]}>
                    <primitive object={mountainsGeo} attach="geometry" />
                    <meshStandardMaterial
                        color="#aa00ff"
                        wireframe
                        transparent
                        opacity={0.08}
                    />
                </mesh>
            </mesh>
        </group>
    )
})

Terrain.displayName = 'Terrain'

export default Terrain
