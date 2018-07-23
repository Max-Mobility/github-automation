#!/usr/bin/env/node

const fs = require("fs");
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const _ = require('lodash');

// our libs
const gh = require('./github');
const files = require('./lib/files');
const inquirer  = require('./lib/inquirer');

//vars
const dir = 'reports'
const reqFileName = 'requirements.json';
let requirements = [];

// check directory
if (!files.directoryExists(dir)) {
	console.log(chalk.red('No '+dir+' folder found - making a new one!'));
	files.makeDirectory(dir);
	process.exit();
}

const run = async () => {
	const report = await inquirer.makeTestReport(requirements);
	console.log(report);
	/*
	const test = await inquirer.performTest();
	console.log(test);
	*/
}

const filelist = fs.readdirSync(dir);

const reqs = gh.scrapeLabels({
	owner: 'PushTracker',
	repo: 'EvalApp',
	patterns: {
		labels: 'SEA-SRS'
	}
}).then((labels) => {
	requirements = labels.map((l) => {
		return {
			name: l.name + ': ' + l.description,
			short: l.name,
			value: l.name
		}
	});
	fs.writeFileSync(reqFileName, JSON.stringify(requirements));
	run();
})
