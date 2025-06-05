import { useState } from 'react'
import './App.css'

import { AnimatePresence, motion } from 'motion/react'

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
    <AnimatePresence>
      {playing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <StartGame wordFactoryArray={wordFactoryArray} />
        </motion.div>
      ) : (
        <motion.div
          key={'home'}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Home />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
