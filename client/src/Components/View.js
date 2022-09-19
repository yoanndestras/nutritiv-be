import * as React from 'react'
import * as THREE from 'three'
import { createPortal, useFrame, useThree, Size } from '@react-three/fiber'
import { useEffect } from 'react'

const isOrthographicCamera = (def) =>
  def && def.isOrthographicCamera
const col = new THREE.Color()

function Container({ canvasSize, scene, index, children, frames, rect, track }) {
  const get = useThree((state) => state.get)
  const camera = useThree((state) => state.camera)
  const virtualScene = useThree((state) => state.scene)
  const setEvents = useThree((state) => state.setEvents)
  
  let frameCount = 0
  useFrame((state) => {
    if (frames === Infinity || frameCount <= frames) {
      rect.current = track.current?.getBoundingClientRect()
      frameCount++
    }
    
    if (rect.current) {
      const { 
        left, 
        right, 
        top, 
        bottom, 
        width, 
        height 
      } = rect.current
      const isOffscreen = bottom < 0 || top > canvasSize.height || right < 0 || left > canvasSize.width
      const positiveYUpBottom = canvasSize.height - bottom
      const aspect = width / height
      
      if (isOrthographicCamera(camera)) {
        if (
          camera.left !== width / -2 ||
          camera.right !== width / 2 ||
          camera.top !== height / 2 ||
          camera.bottom !== height / -2
        ) {
          Object.assign(camera, { left: width / -2, right: width / 2, top: height / 2, bottom: height / -2 })
          camera.updateProjectionMatrix()
        }
      } else if (camera.aspect !== aspect) {
        camera.aspect = aspect
        camera.updateProjectionMatrix()
      }

      state.gl.setViewport(left, positiveYUpBottom, width, height)
      state.gl.setScissor(left, positiveYUpBottom, width, height)
      state.gl.setScissorTest(true)
      
      if (isOffscreen) {
        state.gl.getClearColor(col)
        state.gl.setClearColor(col, state.gl.getClearAlpha())
        state.gl.clear(true, true)
        return
      }

      // When children are present render the portalled scene, otherwise the default scene
      state.gl.render(children ? virtualScene : scene, camera)
    }
  }, index)

  React.useEffect(() => {
    // Connect the event layer to the tracking element
    const old = get().events.connected
    setEvents({ connected: track.current })
    return () => setEvents({ connected: old })
  }, [])

  return <>{children}</>
}

export const View = ({ track, index = 1, frames = Infinity, children }) => {
  const rect = React.useRef(null)
  const { size, scene } = useThree()
  const [virtualScene] = React.useState(() => new THREE.Scene())

  const compute = React.useCallback(
    (event, state) => {
      if (track.current && event.target === track.current) {
        const { width, height, left, top } = rect.current
        const x = event.clientX - left
        const y = event.clientY - top
        state.pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1)
        state.raycaster.setFromCamera(state.pointer, state.camera)
      }
    },
    [rect]
  )

  const [ready, toggle] = React.useReducer(() => true, false)
  React.useEffect(() => {
    // We need the tracking elements bounds beforehand in order to inject it into the portal
    rect.current = track.current?.getBoundingClientRect()
    // And now we can proceed
    toggle()
  }, [])

  return (
    ready &&
    createPortal(
      <Container canvasSize={size} frames={frames} scene={scene} track={track} rect={rect} index={index}>
        {children}
      </Container>,
      virtualScene,
      { events: { compute, priority: index }, size: { width: rect.current.width, height: rect.current.height } }
    )
  )
}