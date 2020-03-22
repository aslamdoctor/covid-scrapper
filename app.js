const express = require('express')
const app = express()
const path = require('path');
const port = process.env.POST || 3000

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const url = 'https://www.worldometers.info/coronavirus/#countries'


// Init body-parser options (inbuilt with express)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

// Fetch Countries
app.get('/countries', function(req, res) {
	fetch(url)
	.then(res => res.text())
	.then(body => {
		const $ = cheerio.load(body, {
			normalizeWhitespace: true
		})

		let countries = []
		let country = "";
		$("#main_table_countries_today tbody tr").each((index, el) => {
			country = $(el).find('td').first().text().trim()
			if(country!=='Total:'){
				countries.push($(el).find('td').first().text().trim())
			}
		});
		return res.json({countries});
	})
	
	//return error(res, 'Error fetching user data');
});

// Fetch Worldwide Cases
app.get('/worldwide_cases', function(req, res) {
	fetch(url)
	.then(res => res.text())
	.then(body => {
		const $ = cheerio.load(body, {
			normalizeWhitespace: true
		})

		let total_cases = 0;
		let total_deaths = 0;
		let total_recovered = 0;
		$(".maincounter-number").each((index, el) => {
			if(index == 0){
				total_cases = $(el).text().trim()
			}
			if(index == 1){
				total_deaths = $(el).text().trim()
			}
			if(index == 2){
				total_recovered = $(el).text().trim()
			}
		})
		return res.json({total_cases, total_deaths, total_recovered});
	})
	
	//return error(res, 'Error fetching user data');
});


// Fetch Country Data
app.post('/fetch_country_data', function(req, res) {
	const country = req.body.country;

	if(country!==''){
		fetch(url)
			.then(res => res.text())
			.then(body => {
				const $ = cheerio.load(body, {
					normalizeWhitespace: true
				})

				let totals = getCasesCount(country, body)
				return res.json({totals});
			})		
	}
	else{
		return res.json('Unknown error occured');
	}
});


// Run the server
app.listen(port, () => console.log(`app listening on port http://localhost:${port}`))


// Helper to get count for selected country
function getCasesCount(country, body){
	const $ = cheerio.load(body, {
		normalizeWhitespace: true
	})

	let found = false
	let total_cases = 0
	let total_new_cases = 0
	let total_deaths = 0
	let total_new_deaths = 0
	let total_recovered = 0

	$("#main_table_countries_today tbody tr").each((index, el) => {
		if($(el).find('td').first().text().trim() == country){
			found = true
			$(el).find('td').each((tdIndex, tdEl) => {
				if(tdIndex == 1){
					total_cases = $(tdEl).text().trim()
				}
				if(tdIndex == 2){
					total_new_cases = $(tdEl).text().trim()
				}
				if(tdIndex == 3){
					total_deaths = $(tdEl).text().trim()
				}
				if(tdIndex == 4){
					total_new_deaths = $(tdEl).text().trim()
				}
				if(tdIndex == 5){
					total_recovered = $(tdEl).text().trim()
				}
			})
		}
	});

	return {
		found,
		total_cases,
		total_new_cases,
		total_deaths, 
		total_new_deaths,
		total_recovered
	}
}
