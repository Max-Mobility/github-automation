// libraries
const ArgumentParser = require('argparse').ArgumentParser;

// our code
const github = require('./github');
const generate_table = require('./generate_table');

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
	[ '-s', '--state' ],
	{
		defaultValue: 'all',
		help: 'The state of the issues',
		choices: ['all', 'open', 'closed']
	}
);
parser.addArgument(
	[ '-l', '--labels' ],
	{
		action: 'append',
		defaultValue: [],
		help: 'Adds a label to the set of labels be filtered on'
	}
);
parser.addArgument(
	[ '-p', '--pattern' ],
	{
		defaultValue: 'requirement-SRS-',
		help: 'A pattern that the labels on the issues should match'
	}
);

// parse the arguments
var args = parser.parseArgs();
// now actually find the issues
/*
github.scrapeIssues({
	owner: args.owner,
	repo: args.repo,
	filters: github.buildFilters(args)
}).then((issues) => {
	issues.map(i => github.printIssue(i));
});

github.scrapeIssues({
	owner: args.owner,
	repo: args.repo,
	filters: github.buildFilters(args),
	patterns: {
		labels: "SRS"
	}
}).then((labels) => {
	console.log(labels.map((l) => l.title));
});
*/
generate_table.generateTable(args.owner, args.repo, args.pattern).then((table) => {
	console.log(table);
});
