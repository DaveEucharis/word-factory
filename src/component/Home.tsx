import { useEffect, useState } from 'react'

import { pickRandomNames } from '../utils/randomNames'

import { listenToSocket, socket } from '../utils/socket'

const Home = () => {
  return (
    <>
      <section className='h-dvh center'>
        <PrepareStart />
      </section>
    </>
  )
}

type OtherPlayers = {
  name: string
  ready: boolean
  id: string
  playing: boolean
}[]

const localStorageName = localStorage.getItem('name') || pickRandomNames()

const PrepareStart = () => {
  const [ready, setReady] = useState(false)
  const [name, setName] = useState(localStorageName)
  const [otherPlayers, setOtherPlayers] = useState<OtherPlayers>([])
  const [timer, setTimer] = useState(-1)

  const handleReady = () => {
    setReady(prev => !prev)
  }

  //NAME UPDATE
  const handleUnselectName = () => {
    localStorage.setItem('name', name)

    socket.emit('name-update', { name, id: socket.id })
  }

  //READY UPDATE
  useEffect(() => {
    socket.emit('ready-update', { ready, id: socket.id })
  }, [ready])

  //NEW PLAYER LOGGED IN
  listenToSocket('connect', () => {
    socket.emit('new-player', name)
  })

  //UPDATE PLAYERS DATA
  listenToSocket('player-update', (data: OtherPlayers) => {
    setOtherPlayers(data)
  })

  //Handle Timer Events
  useEffect(() => {
    let intervalID = 0

    if (otherPlayers.every(v => v.ready === true) && otherPlayers.length > 1) {
      setTimer(3)

      intervalID = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    }

    return () => {
      clearInterval(intervalID)
      setTimer(-1)
    }
  }, [otherPlayers])

  return (
    <>
      <div className='center flex-col gap-4'>
        <div className='h-[25rem] w-[18rem] md:h-[30rem] md:w-[23rem] bg-amber-300 rounded-lg p-4'>
          <input
            type='text'
            placeholder='Player Name'
            value={name}
            onBlur={handleUnselectName}
            onChange={ev => setName(ev.target.value)}
            className='text-center text-2xl md:text-3xl font-bold w-full outline-none'
            maxLength={10}
            minLength={3}
          />

          <ul className='bg-amber-500 h-[80%] rounded-lg mt-4 p-3 overflow-y-auto inset-shadow-black inset-shadow-sm'>
            {otherPlayers.map((v, i) =>
              v.id !== socket.id ? (
                <li
                  key={i}
                  className={
                    'grid grid-cols-2 grid-flow-row rounded-xl shadow-xs shadow-black py-2 px-4 mt-4 transition-bg ' +
                    (v.playing
                      ? 'bg-amber-200'
                      : v.ready
                      ? 'bg-green-400'
                      : 'bg-red-500')
                  }
                >
                  <p className='text-xl md:text-2xl font-semibold '>{v.name}</p>
                  <p className='text-xl md:text-2xl font-semibold text-right opacity-50 '>
                    {v.playing ? 'Playing' : v.ready ? 'Ready' : 'Unready'}
                  </p>
                </li>
              ) : null
            )}
          </ul>

          {timer > -1 ? (
            <p className='font-semibold text-xl md:text-2xl text-center mt-1 text-red-500'>
              starting in . . . <span className='font-bold'>{timer}</span>
            </p>
          ) : null}
        </div>

        <button
          onClick={handleReady}
          className={
            'bg-amber-400 text-2xl md:text-3xl py-2 px-10 rounded-2xl font-bold transition-colors ' +
            (ready ? 'bg-green-500' : '')
          }
        >
          {'Ready' + (ready ? '!' : '?')}
        </button>
      </div>
    </>
  )
}

export default Home
