import { useState, useEffect } from 'react'

export const useKeyboard = () => {
    const [actions, setActions] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false,
        reset: false,
    })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setActions((prev) => ({ ...prev, forward: true }))
                    break
                case 'ArrowDown':
                case 'KeyS':
                    setActions((prev) => ({ ...prev, backward: true }))
                    break
                case 'ArrowLeft':
                case 'KeyA':
                    setActions((prev) => ({ ...prev, left: true }))
                    break
                case 'ArrowRight':
                case 'KeyD':
                    setActions((prev) => ({ ...prev, right: true }))
                    break
                case 'Space':
                    setActions((prev) => ({ ...prev, brake: true }))
                    break
                case 'KeyR':
                    setActions((prev) => ({ ...prev, reset: true }))
                    break
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setActions((prev) => ({ ...prev, forward: false }))
                    break
                case 'ArrowDown':
                case 'KeyS':
                    setActions((prev) => ({ ...prev, backward: false }))
                    break
                case 'ArrowLeft':
                case 'KeyA':
                    setActions((prev) => ({ ...prev, left: false }))
                    break
                case 'ArrowRight':
                case 'KeyD':
                    setActions((prev) => ({ ...prev, right: false }))
                    break
                case 'Space':
                    setActions((prev) => ({ ...prev, brake: false }))
                    break
                case 'KeyR':
                    setActions((prev) => ({ ...prev, reset: false }))
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return actions
}
