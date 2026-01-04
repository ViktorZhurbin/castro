export const bytesToKb = (bytes) => {
  const kB = bytes / 1024;

  if (kB < 0.01) {
    return `${bytes.toFixed(0)} B`
  }

  return `${kB.toFixed(2)} kB`
}

export const msToSeconds = (ms) => {
  const seconds = ms / 1024;

  if (seconds < 0.01) {
    return `${ms.toFixed(0)} ms`
  }

  return `${seconds.toFixed(2)} s`
}
