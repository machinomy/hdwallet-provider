import EventEmitter from 'events'

export class Stoplight extends EventEmitter {
  private isLocked: boolean = true

  go (){
    this.isLocked = false
    this.emit('unlock')
  }

  stop (){
    this.isLocked = true
    this.emit('lock')
  }

  await (fn: () => void) {
    if (this.isLocked) {
      this.once('unlock', fn)
    } else {
      setTimeout(fn)
    }
  }
}
