import { Sun } from './Sun'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export function SceneContainer() {
    const { scene } = useThree()

    useEffect(() => {
        // Set Fog
        scene.fog = new THREE.FogExp2('#080010', 0.015)
        scene.background = new THREE.Color('#020005')
    }, [scene])

    return (
        <>
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
            {/* Sun is STATIC in the world, not child of moving group? 
            In the current CarController architecture, 'Terrain' is inside 'worldRef' which MOVES.
            If we put Sun inside worldRef, it will move with the road and never be 'infinite'.
            We want Sun to be outside worldRef, fixed relative to Camera/Car.
        */}
            <Sun />

            {/* We place these INSIDE the moving world group in App.tsx/CarController.
            Wait, CarController accepts 'worldRef' and moves it.
            So 'InfiniteRoad' and 'SideProps' should be children of that worldRef.
            
            However, this component 'SceneContainer' might be used INSIDE the worldRef?
            Or we export them individually.
            
            Let's export this as a wrapper for the STATIC stuff (Sun, Lights),
            and let App.tsx place Road/Props inside the moving world.
        */}
        </>
    )
}
