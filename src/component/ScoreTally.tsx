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
    const hiddenEle = ele.parentElement?.lastChild as HTMLDivElement
    const ul = hiddenEle.firstChild as HTMLUListElement
    const height = ul.offsetHeight

    if (hiddenEle.offsetHeight === 0) hiddenEle.style.height = height + 'px'
    else hiddenEle.style.height = '0'
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
    <section className='h-full w-90 md:w-100 flex justify-center overflow-hidden py-4'>
      <ul className='flex flex-col w-full gap-4 bg-amber-300 rounded-xl px-4 pb-8 overflow-y-scroll'>
        <header className='flex justify-between items-center w-[90%] p-4 mx-auto rounded-md bg-amber-400'>
          <span className='text-2xl md:text-3xl font-bold'>Player</span>
          <span className='text-2xl md:text-3xl font-bold'>Score</span>
        </header>

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
              <span className='text-xl md:text-2xl font-semibold'>
                {v.name}
              </span>
              <span className='text-2xl md:text-3xl font-bold'>{v.score}</span>
            </div>

            <div className='w-[90%] h-0 mt-2 mx-auto overflow-hidden rounded-md bg-amber-400 transition-height'>
              <ul className='flex flex-wrap p-4 gap-4 max-h-[12rem] overflow-y-auto'>
                {v.result.map((v2, i2) => (
                  <li
                    key={i2}
                    className={
                      'lowercase font-semibold text-center md:text-xl ' +
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

        <button
          onClick={handleReturn}
          className='bg-amber-500 text-2xl md:text-3xl py-2 px-10 rounded-2xl font-bold mx-auto block mt-8'
        >
          Return
        </button>
      </ul>
    </section>
  )
}

export default ScoreTally
