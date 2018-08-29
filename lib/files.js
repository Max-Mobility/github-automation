const fs = require('fs');
const path = require('path');

module.exports = {
	getCurrentDirectoryBase : function() {
		return path.basename(process.cwd());
	},

	fileExists: function(filePath) {
		try {
			return fs.statSync(filePath).isFile();
		} catch (err) {
			return false;
		}
	},

	directoryExists : function(filePath) {
		try {
			return fs.statSync(filePath).isDirectory();
		} catch (err) {
			return false;
		}
	},

	writeFile: function(fname, fdata) {
		try {
			fs.writeFileSync(fname, fdata);
			return true;
		} catch (err) {
			console.log("Couldn't write file "+fname+": "+err);
			return false;
		}
	},

	makeDirectory : function(dirPath) {
		if (this.directoryExists(dirPath)) {
			return false;
		} else {
			try {
				fs.mkdirSync(dirPath);
				return true;
			} catch (err) {
				console.log("Couldn't make " +dirPath+": "+err);
				return false;
			}
		}
	},
};
