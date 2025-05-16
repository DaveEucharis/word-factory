import {
  useState,
  type SyntheticEvent,
  Fragment,
  useEffect,
  useRef,
} from 'react'
import ScoreTally from './ScoreTally'
import { isProd } from '../utils/isProd'

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
  const [timer, setTimer] = useState(3)

  // const [wordFactoryArray, setWordFactoryArray] = useState<WordFactoryArray>([])

  const curtainRef = useRef<HTMLDivElement>(null)

  //EVENT LISTENERS
  const handle = {
    diceClick: function (ev: SyntheticEvent) {
      const selectedLi = ev.currentTarget as HTMLLIElement

      //Nothing Selected Yet
      if (!selectedBlocks.length) {
        setSelectedBlocks([selectedLi])
        setWord(selectedLi.children[0].innerHTML)
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
        setWord(prev => prev + selectedLi.children[0].innerHTML)
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
  const initialCountdown = useRef(true)
  const hasRun = useRef(false)
  useEffect(() => {
    if (!hasRun.current && !isProd) {
      hasRun.current = true
      return
    }

    const intervalID = setInterval(() => {
      setTimer(time => {
        if (time < 1) {
          if (initialCountdown.current) {
            curtainRef.current?.classList.add('-translate-y-[100%]')
            setTimeout(() => {
              curtainRef.current?.classList.add('hidden')

              initialCountdown.current = false
            }, 1000)

            return isProd ? 120 : 5 // 2mins
          } else {
            clearInterval(intervalID)

            curtainRef.current?.classList.remove('hidden')
            setTimeout(() => {
              curtainRef.current?.classList.remove('-translate-y-[100%]')
            }, 0)

            return -1
          }
        }

        return time - 1
      })
    }, 1000)
  }, [])

  const classes = {
    li: 'text-2xl font-bold rounded-md text-center center bg-amber-300 underline transition-outline outline-0',
  }

  ;('rotate-0 rotate-90 rotate-180 rotate-270')

  return (
    <>
      <section className='realtive select-none pt-4'>
        <div
          ref={curtainRef}
          className='absolute h-full bg-amber-200 rounded-lg left-0 right-0 top-0 z-10 center transition-translate'
        >
          {timer > -1 ? (
            <span className='text-8xl font-bold'>{timer}</span>
          ) : (
            <ScoreTally foundWords={foundWords} />
          )}
        </div>
        <ul className='size-80 mx-auto grid grid-cols-5 justify-center gap-2'>
          {wordFactoryArray.map((v, i) => (
            <Fragment key={i}>
              {v.map((v2, i2) => (
                <li
                  key={i2}
                  data-index={String(i) + i2}
                  onClick={handle.diceClick}
                  className={classes.li}
                >
                  <span className={`rotate-${v2.rotation}`}>{v2.letter}</span>
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
        <div className='relative center mt-2 h-14 border-b-2 border-amber-500 mx-auto w-90'>
          <span className='absolute text-2xl -translate-x-35 text-blue-500 font-semibold'>
            {timer}
          </span>
          <h1 className='text-2xl font-semibold bg-amber-400 rounded-2xl px-3'>
            {word}
          </h1>
          <button
            onClick={handle.delete}
            className='absolute text-4xl font-black  text-red-600 ml-4 translate-x-30'
          >
            &#10229;
          </button>
        </div>
        <ul className='flex flex-wrap w-80 mx-auto gap-4 mt-2'>
          {foundWords.map((v, i) => (
            <li
              key={i}
              className='lowercase font-semibold'
            >
              {v}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default StartGame
