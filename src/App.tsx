import { useEffect, useState } from 'react'
import './App.css'

import Home from './component/Home'
import StartGame from './component/StartGame'
import { socket } from './utils/socket'

const App = () => {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const cb = () => {
      setPlaying(true)
    }
    socket.on('start-game', cb)

    return () => {
      socket.off('start-game', cb)
    }
  }, [socket])

  useEffect(() => {
    const cb = () => {
      setPlaying(false)
    }
    socket.on('end-game', cb)

    return () => {
      socket.off('end-game', cb)
    }
  }, [socket])

  return <>{playing ? <StartGame /> : <Home />}</>
}

export default App
