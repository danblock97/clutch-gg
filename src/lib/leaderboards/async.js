export async function mapWithConcurrency(items, limit, mapper) {
	const safeLimit = Math.max(1, Number(limit) || 1);
	const results = new Array(items.length);
	let nextIndex = 0;

	async function worker() {
		while (true) {
			const currentIndex = nextIndex;
			nextIndex += 1;

			if (currentIndex >= items.length) {
				return;
			}

			results[currentIndex] = await mapper(items[currentIndex], currentIndex);
		}
	}

	const workers = Array.from(
		{ length: Math.min(safeLimit, items.length) },
		() => worker()
	);
	await Promise.all(workers);

	return results;
}
