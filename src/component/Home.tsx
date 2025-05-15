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

  return (
    <>
      <div className='center flex-col gap-4'>
        <div
          className={
            'h-[25rem] w-[18rem] bg-amber-300 rounded-lg p-4 transition-outline ' +
            (ready ? 'outline-4 outline-green-500' : '')
          }
        >
          <input
            type='text'
            placeholder='Player Name'
            value={name}
            onBlur={handleUnselectName}
            onChange={ev => setName(ev.target.value)}
            className='text-center text-2xl font-semibold w-full outline-none'
            maxLength={10}
            minLength={3}
          />

          <ul className='bg-amber-500 h-[85%] rounded-lg mt-4 p-3'>
            {otherPlayers.map((v, i) =>
              v.id !== socket.id ? (
                <li
                  key={i}
                  className={
                    'grid grid-cols-2 grid-flow-row rounded-xl shadow-xs shadow-black py-2 px-4 transition-bg ' +
                    (v.playing
                      ? 'bg-amber-200'
                      : v.ready
                      ? 'bg-green-400'
                      : 'bg-red-500')
                  }
                >
                  <p className='text-xl font-semibold '>{v.name}</p>
                  <p
                    className={
                      'text-xl font-semibold text-right  ' +
                      (v.playing
                        ? 'text-amber-400'
                        : v.ready
                        ? 'text-green-600'
                        : 'text-red-600')
                    }
                  >
                    {v.playing ? 'Playing' : v.ready ? 'Ready' : 'Unready'}
                  </p>
                </li>
              ) : null
            )}
          </ul>
        </div>

        <button
          onClick={handleReady}
          className={
            'bg-amber-400 text-2xl py-2 px-10 rounded-2xl font-bold transition-colors ' +
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
