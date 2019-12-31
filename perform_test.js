#!/usr/bin/env node

const fs = require("fs");
const ArgumentParser = require('argparse').ArgumentParser;
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const _ = require('lodash');

// our libs
const gh = require('./github');
const files = require('./lib/files');
const utils = require('./lib/utils');
const inquirer  = require('./lib/inquirer');

// command line arguments

// set up command line arg parsing
let parser = new ArgumentParser({
	version: '0.0.1',
	addHelp: true,
	description: 'Github Automation'
});
parser.addArgument(
	[ '-r', '--repo' ],
	{
		defaultValue: 'EvalApp',
		help: 'Repository to scrape'
	}
);
parser.addArgument(
	[ '-o', '--owner' ],
	{
		defaultValue: 'PushTracker',
		help: 'Owner of the repository'
	}
);
parser.addArgument(
	[ '-s', '--scrape' ],
	{
		action: 'storeTrue',
		defaultValue: false,
		help: 'Force scrape of the repo and update'
	}
);
parser.addArgument(
	[ '-f', '--folder' ],
	{
		defaultValue: './reports',
		help: 'Path to the reports folder containing test report json files.'
	}
);
parser.addArgument(
	[ '-p', '--pattern' ],
	{
		defaultValue: 'SD2-SRS',
		help: 'A pattern that the labels on the issues should match'
	}
);

// parse the arguments
var args = parser.parseArgs();

// where we save the requirement labels
const reqFileName = 'requirements.json';

const getRequirements = async () => {
	let reqs = [];
	if (!fs.existsSync(reqFileName) || args.scrape) {
		console.log("Scraping github for labels according to '"+args.pattern+"'!");
		reqs = await gh.scrapeLabels({
			owner: args.owner,
			repo: args.repo,
			patterns: {
				labels: args.pattern
			}
		});
		reqs = reqs.map((l) => {
			return {
				name: l.name + ': ' + l.description,
				short: l.name,
				value: {
					name: l.name,
					description: l.description
				}
			}
		});
		fs.writeFileSync(reqFileName, JSON.stringify(reqs, null, 2));
		console.log("Wrote " + reqFileName);
	} else {
		reqs = JSON.parse(fs.readFileSync(reqFileName));
	}
	return reqs;
}

const run = async () => {
	// where we save the reports
	const dir = args.folder;
	// now get the reports
	let reports = utils.getReports(dir);
	// select the test
	const test = await inquirer.selectTest(reports);
	// get the requirements
	let requirements = await getRequirements();
	// make a new report
	const report = await inquirer.makeTestReport(test.reports, requirements);
	test.reports.push(report);
	// now output the new report
	let fname = dir + "/SD2-SVR-" + test.number + ".json";
	/*
	if (fs.existsSync(fname)) {
		const suffix = ' (updated)';
		console.log("File already exists at " + fname + ", appending" +suffix);
		fname += suffix;
	}
	*/
	files.writeFile(fname, JSON.stringify(test, null, 2));
	console.log("Wrote report " + fname);
}

// now run the code
run();
