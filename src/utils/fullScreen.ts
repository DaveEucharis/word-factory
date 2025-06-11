export function fullScreenAPI() {
  const body = document.body

  if (!document.fullscreenElement) {
    body.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
