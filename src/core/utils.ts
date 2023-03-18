export function splitToAdjacentPairs<T>(array: T[]) {
  return array.reduce<[T, T][]>((pairs, item, i) => {
    const nextItem = array[i + 1]
    if (nextItem)
      pairs.push([item, nextItem])
    return pairs
  }, [])
}
