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
  const credentials = await inquirer.makeTestReport(requirements);
  console.log(credentials);
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
