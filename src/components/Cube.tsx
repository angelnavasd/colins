import { useRef, useState } from 'react'
import { Group, Vector3 } from 'three'

interface CubeProps {
    position: [number, number, number]
}

const Cube = ({ position }: CubeProps) => {
    const ref = useRef<Group>(null)
    const [velocity, setVelocity] = useState(new Vector3(0, 0, 0))
    const [pos, setPos] = useState(new Vector3(...position))
    const [falling, setFalling] = useState(false)

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
