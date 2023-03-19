interface MouseTrackerOptions {
  traget: Element
  onStart?: (e: MouseEvent) => void
  onStop?: (e: MouseEvent) => void
  onTrack?: (e: MouseEvent) => void
}

export class MouseTracker {
  constructor(public options: MouseTrackerOptions) { }

  enbale = () => {
    const { startTracking, stopTracking } = this
    const { traget } = this.options
    traget.addEventListener('mousedown', startTracking as any)
    window.addEventListener('mouseup', stopTracking)
    window.addEventListener('mouseout', stopTracking)
  }

  disable = () => {
    const { startTracking, stopTracking } = this
    const { traget } = this.options
    stopTracking()
    traget.removeEventListener('mousedown', startTracking as any)
    window.removeEventListener('mouseup', stopTracking as any)
  }

  // record start position for distance calculation by tracking move event.
  // cancel the tracking as soon as mouse up.
  private startTracking = (e: MouseEvent) => {
    e.preventDefault()
    const { tracking, options } = this
    window.addEventListener('mousemove', tracking as any)
    options.onStart?.(e)
  }

  private stopTracking = (e?: MouseEvent) => {
    e?.preventDefault()
    const { tracking, options } = this
    window.removeEventListener('mousemove', tracking as any)
    e && options.onStop?.(e)
  }

  private tracking = (e: MouseEvent) => {
    e.preventDefault()
    const { options } = this
    options.onTrack?.(e)
  }
}
