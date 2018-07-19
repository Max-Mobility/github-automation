const github = require('./github');
const ArgumentParser = require('argparse').ArgumentParser;

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

// parse the arguments
var args = parser.parseArgs();
// now actually find the issues
github.scrapeIssues({
	owner: args.owner,
	repo: args.repo,
	filters: github.buildFilters(args)
}).then((issues) => {
	issues.map(i => github.printIssue(i));
});

