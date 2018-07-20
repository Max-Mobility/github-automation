// libraries
var sys = require('util');
var exec = require('child_process').exec;
const ArgumentParser = require('argparse').ArgumentParser;
const moment = require('moment');
const fs = require('fs');
const pdf = require('html-pdf');
const handlebars = require('handlebars');

// our code
const github = require('./github');
const generate_table = require('./generate_table');

function getCommandLine() {
   switch (process.platform) {
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}

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
	[ '-p', '--pattern' ],
	{
		defaultValue: 'requirement-SRS',
		help: 'A pattern that the labels on the issues should match'
	}
);

// load the templates
var indexTempl = fs.readFileSync('./static/index.html', 'utf8');
var style = fs.readFileSync('./static/style.css', 'utf8');

// parse the arguments
var args = parser.parseArgs();

// now actually create the table
generate_table.generateTable(args.owner, args.repo, args.pattern).then((table) => {
	// turn table into html
	const title = `${moment().format("YYYY-MM-DD")}.${args.pattern}`;
	const html = handlebars.compile(indexTempl)({
		title,
		style,
		table
	});
	const options = { format: 'Letter' };
	const htmlName = `./${title}.html`;
	fs.writeFileSync(htmlName, html);
	console.log(`Wrote ${htmlName}.`);
	const pdfName = `./${title}.pdf`;
	pdf.create(html, options).toFile(pdfName, function(err, res) {
		if (err) return console.log(err);
		console.log(`Wrote ${pdfName} - opening now`);
		exec(getCommandLine() + ' ' + pdfName);
	});
});
