import {
  useState,
  type SyntheticEvent,
  Fragment,
  useEffect,
  useRef,
} from 'react'
import { motion } from 'motion/react'

import ScoreTally from './ScoreTally'
import { isProd } from '../utils/isProd'
import { socket } from '../utils/socket'

import fullscreenIcon from '../assets/fullscreen.svg'

import { fullScreenAPI } from '../utils/fullScreen'

type StartGameProps = {
  wordFactoryArray: {
    letter: string
    rotation: string
  }[][]
}

const StartGame = ({ wordFactoryArray }: StartGameProps) => {
  const [selectedBlocks, setSelectedBlocks] = useState<HTMLLIElement[]>([])
  const [word, setWord] = useState('')
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [timer, setTimer] = useState(isProd ? 120 : 20)

  const curtainRef = useRef<HTMLDivElement>(null)

  //EVENT LISTENERS
  const handle = {
    diceClick: function (ev: SyntheticEvent) {
      const selectedLi = ev.currentTarget as HTMLLIElement

      //Nothing Selected Yet
      if (!selectedBlocks.length && selectedLi.dataset.letter) {
        setSelectedBlocks([selectedLi])
        setWord(selectedLi.dataset.letter)
        return
      }

      const latestBlock = selectedBlocks[selectedBlocks.length - 1]

      //Check for word SUBMIT
      if (selectedLi === latestBlock && word.length >= 3) {
        selectedBlocks.forEach(v => {
          v.classList.remove(
            'outline-4',
            'outline-amber-500',
            'outline-green-500'
          )
        })

        if (!foundWords.includes(word)) setFoundWords(prev => [...prev, word])

        setSelectedBlocks([])
        setWord('')
      }

      //Check sides if can be selected
      if (selectedBlocks.includes(selectedLi)) return

      const LInd = latestBlock.dataset.index?.split('').map(v => Number(v))

      const sInd = selectedLi.dataset.index?.split('').map(v => Number(v))

      if (!LInd || !sInd) return

      if (
        (LInd[0] - 1 === sInd[0] && LInd[1] - 1 === sInd[1]) ||
        (LInd[0] - 1 === sInd[0] && LInd[1] === sInd[1]) ||
        (LInd[0] - 1 === sInd[0] && LInd[1] + 1 === sInd[1]) ||
        (LInd[0] === sInd[0] && LInd[1] + 1 === sInd[1]) ||
        (LInd[0] + 1 === sInd[0] && LInd[1] + 1 === sInd[1]) ||
        (LInd[0] + 1 === sInd[0] && LInd[1] === sInd[1]) ||
        (LInd[0] + 1 === sInd[0] && LInd[1] - 1 === sInd[1]) ||
        (LInd[0] === sInd[0] && LInd[1] - 1 === sInd[1])
      ) {
        setSelectedBlocks(prev => [...prev, selectedLi])
        setWord(prev => prev + selectedLi.dataset.letter)
      }
    },

    delete: function () {
      selectedBlocks[selectedBlocks.length - 1].classList.remove(
        'outline-4',
        'outline-amber-500'
      )

      setSelectedBlocks(prev => prev.slice(0, -1))
      setWord(prev => prev.slice(0, -1))
    },
  }

  useEffect(() => {
    selectedBlocks.forEach((v, i) => {
      if (i === selectedBlocks.length - 1) {
        v.classList.remove('outline-green-500')
        v.classList.add('outline-4', 'outline-amber-500')
      } else {
        v.classList.add('outline-4', 'outline-green-500')
      }
    })
  }, [selectedBlocks])

  //COUNTDOWN TO START

  useEffect(() => {
    const intervalID = setInterval(() => {
      setTimer(time => {
        if (time < 1) {
          //Emit the Found Words
          socket.emit('found-words', foundWords)

          clearInterval(intervalID)

          curtainRef.current?.classList.remove('hidden')
          setTimeout(() => {
            curtainRef.current?.classList.remove('-translate-y-[100%]')
          }, 0)

          return -1
        }

        return time - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalID)
    }
  }, [foundWords])

  const classes = {
    li: 'relative text-3xl md:text-4xl font-bold rounded-md text-center center bg-amber-300 transition-outline outline-0',
  }

  ;('rotate-0 rotate-90 rotate-180 rotate-270')

  return (
    <>
      <motion.section className='realtive select-none pt-4'>
        <div
          ref={curtainRef}
          className='absolute h-full bg-amber-200 rounded-lg left-0 right-0 top-0 z-10 center transition-translate -translate-y-[100%] hidden'
        >
          <ScoreTally />
        </div>

        <ul className='size-80 md:size-90 mx-auto grid grid-cols-5 justify-center gap-2'>
          {wordFactoryArray.map((v, i) => (
            <Fragment key={i}>
              {v.map((v2, i2) => (
                <li
                  key={i2}
                  data-letter={v2.letter}
                  data-index={String(i) + i2}
                  onClick={handle.diceClick}
                  className={classes.li}
                >
                  <span className={`rotate-${v2.rotation}`}>
                    {v2.letter}

                    {v2.letter === 'M' || v2.letter === 'W' ? (
                      <div className='absolute h-0.5 w-4 bg-black bottom-0 left-0 right-0 mx-auto'></div>
                    ) : null}
                  </span>
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
        <div className='relative center mt-2 h-14 border-b-2 border-amber-500 mx-auto w-90 md:w-100 pb-2'>
          <span className='absolute text-2xl md:text-3xl -translate-x-35 md:-translate-x-40 text-blue-500 font-semibold'>
            {timer}
          </span>
          <h1 className='text-2xl md:text-3xl font-semibold bg-amber-400 rounded-2xl px-3'>
            {word}
          </h1>
          <button
            onClick={handle.delete}
            className='absolute text-4xl md:text-5xl font-black  text-red-600 ml-4 translate-x-30 md:translate-x-35'
          >
            &#10229;
          </button>
          <button
            onClick={fullScreenAPI}
            className='absolute w-10 -bottom-6 left-4'
          >
            <img
              src={fullscreenIcon}
              alt=''
            />
          </button>
        </div>

        {/* Found Words */}
        <ul className='flex flex-wrap w-80 mx-auto gap-4 mt-4 overflow-y-auto'>
          {foundWords.map((v, i) => (
            <li
              key={i}
              className='lowercase font-semibold md:text-xl'
            >
              {v}
            </li>
          ))}
        </ul>
      </motion.section>
    </>
  )
}

export default StartGame
