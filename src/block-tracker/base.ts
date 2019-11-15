import { EventEmitter } from 'events'

export const SECOND = 1000

const calculateSum = (accumulator: number, currentValue: number) => accumulator + currentValue
const blockTrackerEvents = ['sync', 'latest']

export interface Options {
  blockResetDuration?: number
}

export type Block = any

export abstract class BaseBlockTracker extends EventEmitter {
  private readonly _blockResetDuration: number
  private _blockResetTimeout: NodeJS.Timeout | undefined = undefined
  private _currentBlock: Block | null = null
  private _isRunning: boolean = false

  protected constructor (opts: Options = {}) {
    super()
    // config
    this._blockResetDuration = opts.blockResetDuration || 20 * SECOND
    // bind functions for internal use
    this._onNewListener = this._onNewListener.bind(this)
    this._onRemoveListener = this._onRemoveListener.bind(this)
    this._resetCurrentBlock = this._resetCurrentBlock.bind(this)
    // listen for handler changes
    this._setupInternalEvents()
  }

  isRunning (): boolean {
    return this._isRunning
  }

  getCurrentBlock (): Block | null {
    return this._currentBlock
  }

  async getLatestBlock (): Promise<Block> {
    // return if available
    if (this._currentBlock) return this._currentBlock
    // wait for a new latest block
    return new Promise(resolve => this.once('latest', resolve))
  }

  // dont allow module consumer to remove our internal event listeners
  removeAllListeners (eventName?: string | symbol | undefined): this {
    // perform default behavior, preserve fn arity
    if (eventName) {
      super.removeAllListeners(eventName)
    } else {
      super.removeAllListeners()
    }
    // re-add internal events
    this._setupInternalEvents()
    // trigger stop check just in case
    this._onRemoveListener()
    return this
  }

  abstract _start (): void

  abstract _end (): void

  private _setupInternalEvents (): void {
    // first remove listeners for idempotence
    this.removeListener('newListener', this._onNewListener)
    this.removeListener('removeListener', this._onRemoveListener)
    // then add them
    this.on('newListener', this._onNewListener)
    this.on('removeListener', this._onRemoveListener)
  }

  private _onNewListener (eventName: string): void {
    // `newListener` is called *before* the listener is added
    if (!blockTrackerEvents.includes(eventName)) return
    this._maybeStart()
  }

  private _onRemoveListener (): void {
    // `removeListener` is called *after* the listener is removed
    if (this._getBlockTrackerEventCount() > 0) return
    this._maybeEnd()
  }

  private _maybeStart (): void {
    if (this._isRunning) return
    this._isRunning = true
    // cancel setting latest block to stale
    this._cancelBlockResetTimeout()
    this._start()
  }

  private _maybeEnd (): void {
    if (!this._isRunning) return
    this._isRunning = false
    this._setupBlockResetTimeout()
    this._end()
  }

  private _getBlockTrackerEventCount (): number {
    return blockTrackerEvents
      .map(eventName => this.listenerCount(eventName))
      .reduce(calculateSum)
  }

  protected _newPotentialLatest (newBlock: Block): void {
    const currentBlock = this._currentBlock
    // only update if blok number is higher
    if (currentBlock && (hexToInt(newBlock) <= hexToInt(currentBlock))) return
    this._setCurrentBlock(newBlock)
  }

  private _setCurrentBlock (newBlock: Block): void {
    const oldBlock = this._currentBlock
    this._currentBlock = newBlock
    this.emit('latest', newBlock)
    this.emit('sync', { oldBlock, newBlock })
  }

  private _setupBlockResetTimeout (): void {
    // clear any existing timeout
    this._cancelBlockResetTimeout()
    // clear latest block when stale
    this._blockResetTimeout = setTimeout(this._resetCurrentBlock, this._blockResetDuration)
    // nodejs - dont hold process open
    if (this._blockResetTimeout.unref) {
      this._blockResetTimeout.unref()
    }
  }

  private _cancelBlockResetTimeout (): void {
    if (this._blockResetTimeout) {
      clearTimeout(this._blockResetTimeout)
    }
  }

  private _resetCurrentBlock (): void {
    this._currentBlock = null
  }

}

function hexToInt(hexInt: string) {
  return Number.parseInt(hexInt, 16)
}
