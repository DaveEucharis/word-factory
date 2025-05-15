import { useLayoutEffect } from 'react'

export function fullScreenAPI() {
  return useLayoutEffect(() => {
    const body = document.body

    body.addEventListener('dblclick', async () => {
      if (!document.fullscreenElement) await body.requestFullscreen()
    })
  }, [])
}
