# github-automation
Automation tools for Design Control Procedures and Documents with
Github Integration

## Installation

```bash
git clone https://github.com/max-mobility/github-automation
cd github-automation
npm install # installs github-api, underscore, argparse
```

## Usage

Right now it just scrapes and filters the repository's issues based on
provided arugments.

```bash
$ node index.js --help
usage: index.js [-h] [-v] [-r REPO] [-o OWNER] [-s {all,open,closed}]
                [-l LABELS]
                

Github Automation

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -r REPO, --repo REPO  Repository to scrape
  -o OWNER, --owner OWNER
                        Owner of the repository
  -s {all,open,closed}, --state {all,open,closed}
                        The state of the issues
  -l LABELS, --labels LABELS
                        Adds a label to the set of labels be filtered on
```
