const fs = require('fs');
const chalk = require("chalk");
const files = require("./files");

module.exports = {
	getReports: function(dir) {
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
	},
	naturalCompare: function (a, b) {
		var ax = [], bx = [];

		a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
		b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
		while(ax.length && bx.length) {
			var an = ax.shift();
			var bn = bx.shift();
			var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
			if(nn) return nn;
		}

		return ax.length - bx.length;
	}
}
