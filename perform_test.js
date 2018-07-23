#!/usr/bin/node

const fs = require("fs");
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const _ = require('lodash');

// our libs
const gh = require('./github');
const files = require('./lib/files');
const inquirer  = require('./lib/inquirer');

// where we save the reports
const dir = 'reports'
// where we save the requirement labels
const reqFileName = 'requirements.json';

const getReports = async () => {
	let reports = [];
	// check directory
	if (!files.directoryExists(dir)) {
		console.log(chalk.red('No '+dir+' folder found - making a new one!'));
		files.makeDirectory(dir);
	} else {
		const filelist = fs.readdirSync(dir);
		reports = filelist.map((fname) => {
			return JSON.parse(fs.readFileSync(dir + '/' + fname));
		});
	}
	return reports;
}

const getRequirements = async () => {
	let reqs = [];
	if (!fs.existsSync(reqFileName)) {
		console.log("Couldn't find " + reqFileName + ", scraping github!");
		reqs = await gh.scrapeLabels({
			owner: 'PushTracker',
			repo: 'EvalApp',
			patterns: {
				labels: 'SEA-SRS'
			}
		});
		reqs = reqs.map((l) => {
			return {
				name: l.name + ': ' + l.description,
				short: l.name,
				value: l.name
			}
		});
		console.log("Wrote " + reqFileName);
		fs.writeFileSync(reqFileName, JSON.stringify(reqs));
		console.log("Wrote " + reqFileName);
	} else {
		reqs = JSON.parse(fs.readFileSync(reqFileName));
	}
	return reqs;
}

const run = async () => {
	let requirements = await getRequirements();
	let reports = await getReports();
	const report = await inquirer.makeTestReport(requirements);
	let fname = dir + "/SEA-SVR-" + report.testNumber + "-" + report.revision + ".json";
	if (fs.existsSync(fname)) {
		const suffix = ' (updated)';
		console.log("File already exists at " + fname + ", appending" +suffix);
		fname += suffix;
	}
	files.writeFile(fname, JSON.stringify(report, null, 2));
	console.log("Wrote report " + fname);
}

// now run the code
run();
