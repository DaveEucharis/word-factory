import { io } from 'socket.io-client'
import { isProd } from './isProd'
import { useEffect } from 'react'

const link = isProd
  ? 'https://word-factory-server.onrender.com'
  : 'http://localhost:8080'

export const socket = io(link, {
  transports: ['websocket'],
})

export function listenToSocket(evName: string, cb: (...args: any) => void) {
  useEffect(() => {
    socket.on(evName, cb)

    return () => {
      socket.off(evName, cb)
    }
  }, [socket])
}
