import { useState } from 'react'
import './App.css'

import Home from './component/Home'
import StartGame from './component/StartGame'
import { listenToSocket } from './utils/socket'
import { fullScreenAPI } from './utils/fullScreen'

type WordFactoryArray = {
  letter: string
  rotation: string
}[][]

const App = () => {
  const [playing, setPlaying] = useState(false)
  const [wordFactoryArray, setWordFactoryArray] = useState<WordFactoryArray>([])

  listenToSocket('word-factory-array', (data: WordFactoryArray) => {
    setWordFactoryArray(data)
  })

  listenToSocket('start-game', () => {
    setPlaying(true)
  })

  listenToSocket('end-game', () => {
    setPlaying(false)
  })

  fullScreenAPI()

  return (
    <>
      {playing ? <StartGame wordFactoryArray={wordFactoryArray} /> : <Home />}
    </>
  )
}

export default App
