const inquirer = require('inquirer');
const files = require('./files');
const utils = require('./utils');

module.exports = {

	makeTestReport: (requirements) => {
		const questions = [
			{
				name: 'testNumber',
				type: 'input',
				message: 'Enter the test number:',
				validate: function( value ) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a test number.';
					}
				}
			},
			{
				name: 'requirements',
				type: 'checkbox',
				message: 'Select the requirements associated with this test:',
				choices: requirements.sort((a,b) => utils.naturalCompare(a.name, b.name)),
				default: [],
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'You must select at least one requirement.';
					}
				}
			}
		];
		return inquirer.prompt(questions);
	},
}
