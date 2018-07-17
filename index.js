const GitHub = require('github-api');
//const Promise = require('es6-promise').Promise;
const _ = require('underscore');
const ArgumentParser = require('argparse').ArgumentParser;


let GITHUB_USERNAME = process.env.GITHUB_USERNAME;
let GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

if (!GITHUB_USERNAME || !GITHUB_PASSWORD) {
	// DO SOMETHING HERE
}

let gh = new GitHub({
	username: GITHUB_USERNAME,
	password: GITHUB_PASSWORD
});

function issueContainsLabel(issue, label) {
	return issue.labels.reduce((a, e) => {
		return a || e.name == label;
	}, false);
}

function scrapeIssues(opts) {
	let owner = opts.owner;
	let repo = opts.repo;
	let listOpts = {
		state: 'all',
		labels: opts.filters.filter((f) => f.key == 'label').map((f) => f.value).join()
	};
	console.log(listOpts);
	return gh.getIssues(owner, repo).listIssues(listOpts).then((issues) => {
		issues = issues.data;
		return issues;
	}).catch((err) => {
		console.log(`Couldn not get issues: ${err}`);
		return [];
	});
}

let scrapeOpts = {
	owner: 'PushTracker',
	repo: 'EvalApp',
	filters: [
		{
			key: 'label',
			value: 'requirement-SRS-5-A'
		}
	]
};

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
	[ '-l', '--label' ],
	{
		action: 'append',
		defaultValue: [],
		help: 'A label to be filtered on'
	}
);

var args = parser.parseArgs();

scrapeIssues({
	owner: args.owner,
	repo: args.repo,
	filters: args.label.map(l => { return { key: 'label', value: l }; })
}).then((issues) => {
	console.log(issues.map(i => i.number));
});

