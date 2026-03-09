// Shim for promise-limit CJS module in Cloudflare Workers runtime
export default function promiseLimit(concurrency: number) {
    let active = 0;
    const queue: Array<() => void> = [];

    function run<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            function execute(): void {
                active++;
                fn()
                    .then(resolve, reject)
                    .finally(() => {
                        active--;
                        if (queue.length > 0) {
                            queue.shift()!();
                        }
                    });
            }

            if (active < concurrency) {
                execute();
            } else {
                queue.push(execute);
            }
        });
    }

    return run;
}
