/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 - Gapminder Clone
 */

const MARGIN = { LEFT: 150, RIGHT: 100, TOP: 75, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 600 - MARGIN.TOP - MARGIN.BOTTOM;
const continents = ['asia', 'americas', 'africa', 'europe'];

const svg = d3
	.select('#chart-area')
	.append('svg')
	.attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
	.style('background-color', 'rgba(8, 7, 7, 0.05)');

const g = svg
	.append('g')
	.attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// x label
g.append('text')
	.attr('class', 'x axis-label')
	.attr('x', WIDTH / 2)
	.attr('y', HEIGHT + 60)
	.attr('font-size', '20px')
	.attr('text-anchor', 'middle')
	.text('GDP Per Capita ($)');

// y label
const yLabel = g
	.append('text')
	.attr('class', 'y axis-label')
	.attr('x', -(HEIGHT / 2))
	.attr('y', -60)
	.attr('font-size', '20px')
	.attr('text-anchor', 'middle')
	.attr('transform', 'rotate(-90)')
	.text('Life Expectancy (Years)');

// Date label
const timeLabel = g
	.append('text')
	.attr('y', HEIGHT - 10)
	.attr('x', WIDTH - 40)
	.attr('font-size', '40px')
	.attr('opacity', '.4')
	.attr('text-anchor', 'middle')
	.text('1800');

// Scales
const x = d3.scaleLog().domain([100, 150000]).range([0, WIDTH]);

const y = d3.scaleLinear().domain([0, 90]).range([HEIGHT, 0]);

// const pop = d3.scaleLog().range([6, 40]);

const pop = d3
	.scaleLinear()
	.range([25 * Math.PI, 1500 * Math.PI])
	.domain([2000, 1400000000]);

const continentColor = d3
	.scaleOrdinal()
	.domain(continents)
	.range(d3.schemeTableau10);

const xAxisGroup = g
	.append('g')
	.attr('class', 'x axis')
	.attr('transform', `translate(0, ${HEIGHT})`);

const yAxisGroup = g.append('g').attr('class', 'y axis');

const xAxisCall = d3
	.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d3.format(','));

xAxisGroup
	.call(xAxisCall)
	.selectAll('text')
	.attr('y', '10')
	.attr('x', '-5')
	.attr('text-anchor', 'middle');

const yAxisCall = d3.axisLeft(y).ticks(10);
yAxisGroup.call(yAxisCall);

// Legend Labels
const legend = g.append('g');

continents.forEach((continent, i) => {
	const legendRow = legend
		.append('g')
		.attr('transform', `translate(${i * 20}, 0)`);

	legendRow
		.append('text')
		.attr('x', `${WIDTH / (6 / i) + 100}`)
		.attr('transform', function (d, i) {
			return `translate( ${
				((i % 4) * WIDTH) / 6
			}  ,  ${Math.floor(i / 4) * 20})`;
		})
		.text(continent.charAt(0).toUpperCase() + continent.slice(1))
		.attr('text-anchor', 'middle')
		.attr('fill', continentColor(continent));
});

let counter = 0;
let restart = false;

d3.json('data/data.json').then((data) => {
	const formattedData = data.map((period) => {
		return {
			year: period['year'],
			countries: period['countries']
				.filter((country) => {
					const dataExists = country.income && country.life_exp;
					return dataExists;
				})
				.map((country) => {
					country.income = Number(country.income);
					country.life_exp = Number(country.life_exp);
					country.population = Number(country.population);
					return country;
				}),
		};
	});
	console.log(formattedData);

	const interval = d3.interval(function () {
		counter = counter < 214 ? counter + 1 : 0;
		update(formattedData[counter]);
	}, 100);

	update(formattedData[0]);
});

function update(data) {
	const t = d3.transition().duration(100);

	// JOIN new data with old elements
	const circles = g
		.selectAll('circle')
		.data(data.countries, (d) => `${d.year}${d.country}`);

	// EXIT old elements not present in new data
	circles.exit().remove();

	// ENTER new elements present in new data
	circles
		.enter()
		.append('circle')
		.attr('fill', (d) => continentColor(d.continent))
		.merge(circles)
		.transition(t)
		.attr('cx', (d) => x(d.income))
		.attr('cy', (d) => y(d.life_exp))
		.attr('r', (d) => Math.sqrt(pop(d.population) / Math.PI));

	// update time label
	timeLabel.text(String(data.year));
}
