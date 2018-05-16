declare module 'ganache-core' {
  namespace Ganache {
    export class Server {
      listen (port: number, done: Function)
      close (done: Function)
    }

    export function server(): Server
  }

  export = Ganache
}
