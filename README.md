# cli-ls

[![npm-version](https://img.shields.io/npm/v/cli-ls.svg?style=flat-square)](https://www.npmjs.com/package/cli-ls)
[![dependencies-status](https://img.shields.io/david/aziascreations/cli-ls.svg?style=flat-square)](https://david-dm.org/aziascreations/cli-ls#info=dependencies)

A simple version of the ls command to replace window's dir command.

## Important notes

The "program" isn't finished yet and should not be used at the moment.

Command prompt's aliases might cause some errors, I haven't checked it out yet.

## Install & more

**Install :**
```
npm i -g cli-ls
```
You might have to set NodeJS as your default program to run .js files in Windows.

**Update :**
```
npm update -g cli-ls
```

**Uninstall :**
```
npm uninstall -g cli-ls
```

## Usage

```
ls [OPTION]... [FILE]...
```

### Options:

New or changed options are in bold.

Short | Long | Effect
--- | --- | ---
-a | --all | Do not ignore entries starting with .
-h | --human-readable | With -l and/or -s, print human readable sizes (e.g., 1K 234M 2G)
-l | --list | Use a long listing format
-m | --comma | Fill width with a comma separated list of entries
-R | --recursive | List subdirectories recursively
 | --help | Display the help and exit
 | --version | Output version information and exit

### Temporary Options:

Option | Effect
--- | ---
--debug | Display some debugging informations and exit
--src | TEMP: folder(s) to list

## Requirements

Node v4+ for [winattr](https://www.npmjs.com/package/winattr)

## Dependencies

#### NodeJS modules
* [fs](https://nodejs.org/api/fs.html)
* [path](https://nodejs.org/api/path.html)

#### Other Modules
* [chalk](https://www.npmjs.com/package/chalk)
* [command-line-args](https://www.npmjs.com/package/command-line-args)
* [command-line-usage](https://www.npmjs.com/package/command-line-usage)
* [dateformat](https://www.npmjs.com/package/dateformat)
* [glob](https://www.npmjs.com/package/glob)
* [pretty-bytes](https://www.npmjs.com/package/pretty-bytes)
* [supports-color](https://www.npmjs.com/package/supports-color)
* [text-table](https://www.npmjs.com/package/text-table)
* [winattr](https://www.npmjs.com/package/winattr)

## License
[WTFPL](http://www.wtfpl.net/)
