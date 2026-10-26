export function createLimiter(concurrency: number) {
  const limit = Math.max(1, Math.min(concurrency, 8));
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    active--;
    queue.shift()?.();
  };

  return async function limited<T>(task: () => Promise<T>): Promise<T> {
    if (active >= limit)
      await new Promise<void>((resolve) => queue.push(resolve));
    active++;
    try {
      return await task();
    } finally {
      next();
    }
  };
}
