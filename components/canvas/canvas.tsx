import styled from 'styles'
import state, { useSelector } from 'state'
import inputs from 'state/inputs'
import React, { useCallback, useRef } from 'react'
import useZoomEvents from 'hooks/useZoomEvents'
import useCamera from 'hooks/useCamera'
import Defs from './defs'
import Page from './page'
import Brush from './brush'
import Bounds from './bounds/bounding-box'
import BoundsBg from './bounds/bounds-bg'
import Selected from './selected'
import Handles from './bounds/handles'
import { isMobile } from 'utils/utils'

export default function Canvas() {
  const rCanvas = useRef<SVGSVGElement>(null)
  const rGroup = useRef<SVGGElement>(null)

  useCamera(rGroup)
  useZoomEvents()

  const isReady = useSelector((s) => s.isIn('ready'))

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!inputs.canAccept(e.pointerId)) return
    rCanvas.current.setPointerCapture(e.pointerId)
    state.send('POINTED_CANVAS', inputs.pointerDown(e, 'canvas'))
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      state.send('TOUCH_UNDO')
    } else {
      if (isMobile()) {
        state.send('TOUCHED_CANVAS')
        // state.send('POINTED_CANVAS', inputs.touchStart(e, 'canvas'))
        // e.preventDefault()
        // e.stopPropagation()
      }
    }
  }, [])

  // const handleTouchMove = useCallback((e: React.TouchEvent) => {
  //   if (!inputs.canAccept(e.touches[0].identifier)) return
  //   if (inputs.canAccept(e.touches[0].identifier)) {
  //     state.send('MOVED_POINTER', inputs.touchMove(e))
  //   }
  // }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!inputs.canAccept(e.pointerId)) return
    if (inputs.canAccept(e.pointerId)) {
      state.send('MOVED_POINTER', inputs.pointerMove(e))
    }
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!inputs.canAccept(e.pointerId)) return
    rCanvas.current.releasePointerCapture(e.pointerId)
    state.send('STOPPED_POINTING', { id: 'canvas', ...inputs.pointerUp(e) })
  }, [])

  return (
    <MainSVG
      ref={rCanvas}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      // onTouchMove={handleTouchMove}
    >
      <Defs />
      {isReady && (
        <g ref={rGroup}>
          <BoundsBg />
          <Page />
          <Selected />
          <Bounds />
          <Handles />
          <Brush />
        </g>
      )}
    </MainSVG>
  )
}

const MainSVG = styled('svg', {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  touchAction: 'none',
  zIndex: 100,
  backgroundColor: '$canvas',

  '& *': {
    userSelect: 'none',
  },
})
