import { useState, type SyntheticEvent } from 'react'
import { listenToSocket, socket } from '../utils/socket'

type TallyScore = {
  name: string
  result: { word: string; valid: boolean }[]
  score: number
  id: string
}[]

const ScoreTally = () => {
  const [tallyResult, setTallyResult] = useState<TallyScore>([])

  //Listeners
  const showResultWords = (ev: SyntheticEvent) => {
    const ele = ev.currentTarget as HTMLLIElement
    const hiddenEle = ele.parentElement?.lastChild as HTMLUListElement

    if (hiddenEle.classList.contains('max-h-0')) {
      hiddenEle.classList.remove('max-h-0')
      hiddenEle.classList.add('max-h-[10rem]')
    } else {
      hiddenEle.classList.remove('max-h-[10rem]')
      hiddenEle.classList.add('max-h-0')
    }
  }

  const scorePlacesStyle = (index: number) => {
    if (index === 0) return 'bg-yellow-500 outline-yellow-600 outline-2'
    if (index === 1) return 'bg-neutral-500 outline-neutral-600 outline-2'
    if (index === 2) return 'bg-yellow-900 outline-yellow-950 outline-2'

    return 'bg-amber-400'
  }

  const handleReturn = () => {
    socket.emit('return')
  }

  //Listen to Result
  listenToSocket('tally-result', (data: TallyScore) => {
    setTallyResult(data)
  })

  return (
    <section className='h-full w-70 bg-amber-300'>
      <ul className='flex flex-col w-full gap-4 pt-8'>
        {tallyResult.map((v, i) => (
          <li key={i}>
            <div
              data-id={v.id}
              onClick={showResultWords}
              className={
                'flex justify-between items-center w-[90%] rounded-md h-12 mx-auto p-4 ' +
                scorePlacesStyle(i)
              }
            >
              <span className='text-xl font-semibold'>{v.name}</span>
              <span className='text-2xl font-semibold'>{v.score}</span>
            </div>

            <div className='w-[90%] max-h-0 mt-2 mx-auto overflow-hidden rounded-md bg-amber-500 transition-height'>
              <ul className='p-4 flex flex-wrap gap-4'>
                {v.result.map((v2, i2) => (
                  <li
                    key={i2}
                    className={
                      'lowercase font-semibold ' +
                      (!v2.valid ? 'opacity-90 line-through' : '')
                    }
                  >
                    {v2.word}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleReturn}
        className='bg-amber-500 text-2xl py-2 px-10 rounded-2xl font-bold mx-auto block mt-8'
      >
        Return
      </button>
    </section>
  )
}

export default ScoreTally
