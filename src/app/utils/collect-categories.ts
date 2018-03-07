export default function(data: ITimeRangeValues[])
{
	const categories: Map<string, (number | undefined)[]> = new Map();

	data.forEach(item =>
	{
		for (const category in item.data) {
			if (!item.data.hasOwnProperty(category)) continue;
			categories.set(category, []);
		}
	});

	data.forEach(item =>
	{
		categories.forEach((list, category) =>
		{
			const value = item.data[category];
			list.push(value === undefined ? undefined : Math.abs(value) < 0.01 ? undefined : value);
		});
	});

	console.debug("Categories:", categories);

	return categories;
}
