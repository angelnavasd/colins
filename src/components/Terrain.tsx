import { forwardRef } from 'react'
import { Group } from 'three'

const Terrain = forwardRef<Group>((_props, ref) => {
    return (
        <group ref={ref}>
            {/* Flat Mars terrain - circular platform (4x larger) */}
            <mesh name="Terrain" receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <circleGeometry args={[400, 128]} />
                <meshStandardMaterial color="#aa7755" roughness={0.9} />
            </mesh>

            {/* Edge ring to show boundary */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[395, 400, 128]} />
                <meshStandardMaterial color="#553322" />
            </mesh>

            {/* Grid for movement reference */}
            <gridHelper args={[800, 80, '#885533', '#774422']} position={[0, 0.02, 0]} />
        </group>
    )
})

Terrain.displayName = 'Terrain'

export default Terrain
