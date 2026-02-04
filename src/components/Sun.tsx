import { useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Refined shader for the classic look
const refinedFragmentShader = `
varying vec2 vUv;
uniform vec3 colorTop;
uniform vec3 colorBottom;

void main() {
  // Gradient from bottom (yellow) to top (pink)
  vec3 color = mix(colorBottom, colorTop, vUv.y);
  
  // Stripes logic
  // We utilize a sine wave that changes frequency with Y
  // We want the 'cut' parts to be discarded or transparent
  
  float y = vUv.y;
  
  // Frequency increases towards the bottom (y=0)
  float frequency = 100.0 * (1.1 - y); // Higher freq at bottom
  float stripe = sin(y * frequency);
  
  // Threshold also can vary to change stripe thickness
  float threshold = 0.2; // Adjust for gap size
  
  float alpha = 1.0;
  if (stripe < threshold && y < 0.6) { // Only stripe the bottom 60%
     alpha = 0.0;
  }
  
  // Anti-aliasing edges of stripes via smoothstep not strictly necessary for retro feel, but nice.
  
  gl_FragColor = vec4(color, alpha);
}
`

export function Sun() {
    const meshRef = useRef<THREE.Mesh>(null)

    // Position it far away.
    // We can also make it follow the camera in X to simulate "infinite distance" parallax manually if needed,
    // but putting it very far usually works if the world moves and sun stays.
    // Actually in our logic the "World" moves, so the Sun should be outside the moving world group.

    const uniforms = useRef({
        colorTop: { value: new THREE.Color('#ff00cc') }, // Deep Pink
        colorBottom: { value: new THREE.Color('#ffcc00') } // Sunset Yellow
    })

    return (
        <mesh ref={meshRef} position={[0, 100, -500]}>
            <circleGeometry args={[80, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={refinedFragmentShader}
                uniforms={uniforms.current}
                transparent={true}
            />
        </mesh>
    )
}
