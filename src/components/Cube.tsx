import { useRef, useState } from 'react'
import { Group, Vector3 } from 'three'

interface CubeProps {
    position: [number, number, number]
}

const Cube = ({ position }: CubeProps) => {
    const ref = useRef<Group>(null)
    const [pos] = useState(new Vector3(...position))

    return (
        <group ref={ref} position={pos.toArray()}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color="#7788aa" metalness={0.3} roughness={0.7} />
            </mesh>
        </group>
    )
}

export default Cube
