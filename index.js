// Importing NodeJS and npm modules
const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const cliArgs = require('command-line-args');
const cliUsage = require('command-line-usage');
const dateFormat = require('dateformat');
const glob = require('glob');
const prettyBytes = require('pretty-bytes');
const supportsColor = require('supports-color');
const table = require('text-table');
const winattr = require('winattr');

// Declaring "command-line-args" options
// This comment is here so I can hide this in Brackets
const cliOptions = [
	{
		name: 'all',
		alias: 'a',
		description: 'Do not ignore hidden entries and/or entries starting with .',
		type: Boolean
	},
	{
		name: 'almost-all',
		alias: 'A',
		description: 'Do not ignore hidden entries and do not list implied . and ..',
		type: Boolean
	},
	{
		name: 'debug',
		alias: 'd',
		description: 'Display some debugging informations and exit',
		type: Boolean
	},
	{
		name: 'classify',
		alias: 'F',
		description: 'Append indicator (one of */=>@|) to entries',
		type: Boolean
	},
	{
		name: 'human-readable',
		alias: 'h',
		description: 'With -l and/or -s, print human readable sizes (e.g., 1K 234M 2G)',
		type: Boolean
	},
	{
		name: 'list',
		alias: 'l',
		description: 'Use a long listing format',
		type: Boolean
	},
	{
		name: 'comma',
		alias: 'm',
		description: 'Fill width with a comma separated list of entries',
		type: Boolean
	},
	{
		name: 'indicator-style',
		alias: 'p',
		description: 'Unfinished: Append / indicator to directories',
		type: Boolean
	},
	{
		name: 'recursive',
		alias: 'R',
		description: 'List subdirectories recursively',
		type: Boolean
	},
	{
		name: 'show-control-chars',
		description: 'TEMP: Used to prevent some aliases errors.',
		type: Boolean
	},
	{
		name: 'src',
		description: 'TEMP: folder(s) to list',
		type: String,
		multiple: false,
		defaultOption: true
	},
	{
		name: 'help',
		description: 'Display this help and exit',
		type: Boolean
	},
	{
		name: 'version',
		description: 'Output version information and exit',
		type: Boolean
	}
];

// Parsing cli arguments
var options;
try {
	options = cliArgs(cliOptions);
} catch(err) {
	switch(err.name) {
		case "UNKNOWN_OPTION":
			console.log("Error: Unknown option used.");
			break;
		case "NAME_MISSING":
			console.log("Internal error: An option's name is missing.");
			break;
		case "INVALID_TYPE":
			console.log("Internal error: INVALID_TYPE.");
			break;
		case "INVALID_ALIAS":
			console.log("Internal error: INVALID_ALIAS.");
			break;
		case "DUPLICATE_NAME":
			console.log("Internal error: Defined two or more options with the same name.");
			break;
		case "DUPLICATE_ALIAS":
			console.log("Internal error: Defined two or more options with the same alias.");
			break;
		case "DUPLICATE_DEFAULT_OPTION":
			console.log("Internal error: More than one default option is defined.");
			break;
		default:
			console.log("Unknown error: %s", err.name);
			break;
	}
	//TODO: find a way to show it
	console.log(err);
	process.exit(2);
}

// http://www.thepreparednesspodcast.com/quick-list-on-executable-file-extensions-updated/
const execFileExt = [
	//"action",
	//"apk",
	//"app",
	"bat",
	"bin",
	"cmd",
	"com",
	//"command",
	"cpl",
	//"csh",
	"exe",
	"gadget",
	//"inf",
	"ins",
	"inx",
	//"ipa",
	"isu",
	"job",
	"jse",
	//"ksh",
	//"lnk", ??? symlink
	"msc",
	"msi",
	"msp",
	"mst",
	//"osx",
	//"out",
	"paf",
	"pif",
	//"prg",
	"ps1",
	"reg",
	"rgs",
	//"run",
	"sct",
	"sh",
	"shb",
	"shs",
	"u3p",
	"vb",
	"vbe",
	"vbs",
	"vbscript",
	//"workflow",
	"ws",
	"wsf"
]

// Help & Version things
if(options.help) {
	// Help text structure
	var cliHelp = [
		{
			header: 'USAGE:',
			content: [
				'ls [[italic]{OPTION}]... [[italic]{FILE}]...', //the [FILE]... isn't supported yet. - just make a loop...
				'ls -a C:\\'
			]
		},
		{
			header: 'DESCRIPTION:',
			content: 'List information about the FILE(s) (the current directory by default).'
		},
		{
			header: 'OPTIONS:',
			optionList: cliOptions
		},
		{
			header: 'EXIT STATUS:',
			content: [
				'0   if OK.',
				'1   if minor problems (e.g., cannot access subdirectory).',
				'2   if serious trouble (e.g., cannot access command-line argument).'
			]
		}
	];
	console.log(cliUsage(cliHelp));
	process.exit(0);
}
if(options.version) {
	var pkgjson = require('./package.json');
	console.log(pkgjson.version);
	process.exit(0);
}

// Setting "C:" as the src outputs a strange normalized path.
// Reading the --src arg and doing some magic
var currentWorkingDir = (options.src == null) ? process.cwd() : path.normalize(options.src);
if(!fs.existsSync(currentWorkingDir)) {
	console.error("Error: Invalid path (%s)", currentWorkingDir);
	process.exit(1);
}
try {
	process.chdir(currentWorkingDir);
} catch(err) {
	console.error("Error: Unable to change the working directory (%s)", currentWorkingDir);
	console.error(err);
	process.exit(1);
}

// Declaring and setting up glob options
var globOptions = {
	dot: false,
	recursive: false,
	fullMode: false,
	suffix: false
};

// Setting up the glob options
globOptions.pattern = "*";

if(options.all)
	globOptions.dot = true;
if(options.recursive)
	globOptions.recursive = true;
if(options.list)
	globOptions.fullMode = true;

// Output debug informations
if(options.debug) {
	console.log("cli-ls debug:\n");
	
	console.log("Launch options:\n  %s\n", JSON.stringify(options));
	
	console.log("Glob options:\n  %s\n", JSON.stringify(globOptions));
	
	console.log("Chalk Test:");
	console.log("  %s, %s, %s, %s, %s, %s, %s, %s",
		chalk.reset(chalk.red("reset")), chalk.bold("bold"), chalk.dim("dim"),
		chalk.italic("italic"), chalk.underline("underline"), chalk.inverse("inverse"),
		chalk.hidden("hidden"), chalk.strikethrough("strikethrough")
	);
	console.log("  %s, %s, %s, %s, %s, %s, %s, %s, %s",
		chalk.red("red"), chalk.green("green"), chalk.yellow("yellow"),
		chalk.blue("blue"), chalk.magenta("magenta"), chalk.cyan("cyan"), 
		chalk.white("white"), chalk.gray("gray"), chalk.black("black")
	);
	console.log("  %s, %s, %s, %s, %s, %s, %s, %s\n",
		chalk.bgRed("red"), chalk.bgGreen("green"), chalk.bgYellow("yellow"),
		chalk.bgBlue("blue"), chalk.bgMagenta("magenta"), chalk.bgCyan("cyan"),
		chalk.bgWhite("white"), chalk.bgBlack("black")
	);
	
	console.log("Terminal Informations:");
	console.log("  Basic color support: %s", supportsColor ? "yes" : "no");
	console.log("  256 colors support: %s", supportsColor.has256 ? "yes" : "no");
	console.log("  Truecolor support: %s", supportsColor.has16m ? "yes" : "no");
	console.log("  Size: %sx%s", process.stdout.columns, process.stdout.rows);
	process.exit(0);
}

glob.glob(globOptions.pattern, globOptions, function(err, files) {
	if(err)
		console.error(err);
	
	simpleDirWalk(files, false);
	
	if(options.recursive)
		recursiveDirWalk(files);
});

function simpleDirWalk(files, wasFiltered) {
	if(!wasFiltered)
		files = filterWindowsHiddenFiles(files);
	
	if(options.list)
		printList(files);
	else if(options.comma)
		printCommaLines(files);
	else
		printDefaultLines(files);
}

// Used with -R / --recursive
function recursiveDirWalk(files) {
	console.log("");
	
	//Has to be called here too so hidden folder aren't listed.
	files = filterWindowsHiddenFiles(files);
	
	files.forEach(function(filePath) {
		var fileStat = getFileStats(filePath);
		
		if(fileStat.isDirectory) {
			var fileName = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
			console.log(chalk.cyan('./' + fileName + ':'));
			
			var dirFiles = glob.sync(path.join(filePath, '*'), globOptions);
			simpleDirWalk(dirFiles, true);
			recursiveDirWalk(dirFiles);
		}
	});
}

//Not optimised at all...
function filterWindowsHiddenFiles(files) {
	if(options["almost-all"] || options.all)
		return files;
	
	var newFiles = [];
	
	files.forEach(function(file) {
		var fileAttributes = getFileAttributes(file, false);
		if(!fileAttributes)
			return;
		
		if(!fileAttributes.hidden)
			newFiles.push(file);
	});
	
	return newFiles;
}

// Used by default
function printDefaultLines(files) {
	var output = "";
	
	for(var i = 0; i < files.length; i++) {
		// If the width of the text more of a console window, stop the summation
		if(output.length > process.stdout.columns) {
			output = false;
			break;
		}
		var fileStat = getFileStats(files[i]);
		var fileName = appendFileSuffix(path.basename(files[i]), fileStat);
		output += (fileStat.isDirectory) ? chalk.cyan(fileName) + '    ' : fileName + '    ';
	}
	
	if(!output) {
		files.forEach(function(file) {
			var fileStat = getFileStats(file);
			var fileName = appendFileSuffix(path.basename(file), fileStat);
			fileName = fileStat.isDirectory ? chalk.cyan(fileName) : fileName;
			
			console.log(fileName);
		});
	} else {
		console.log(output);
	}
}

// Used with -m / --comma
function printCommaLines(files) {
	var output = "",
		usedWidth = 0;
	
	for(var i = 0; i < files.length; i++) {
		var fileStat = getFileStats(files[i]);
		var fileName = appendFileSuffix(path.basename(files[i]), fileStat);
		var a = (fileStat.isDirectory) ? chalk.cyan(fileName) + ', ' : fileName + ', ';
		
		//The "-2" seems to fix some issues.
		if(usedWidth+fileName.length+2 >= process.stdout.columns-2) {
			console.log(output);
			output = "";
			usedWidth = 0;
		}
		usedWidth += fileName.length+2;
		output += a;
	}
	
	console.log(output);
}

// Used with -l / --list
function printList(files) {
	var filesArray = [];
	
	files.forEach(function(file) {
		var fileStat = getFileStats(file);
		var fileName = appendFileSuffix(path.basename(file), fileStat);
		var fileBirtTime = fileStat.birthtime;
		
		fileName = fileStat.isDirectory ? chalk.cyan(fileName) : fileName;
		
		if(!fileStat) {
			filesArray.push([
				" " + (fileStat.isDirectory ?"d":"-") + "????",
				"/",
				"/",
				"/",
				chalk.red(fileName)
			]);
			return;
		}
		
		filesArray.push([
			" " + (fileStat.isDirectory ?"d":"-") + getFileAttributes(file, true),
			fileStat.size,
			dateFormat(fileBirtTime, 'mmm dd'),
			dateFormat(fileBirtTime, 'hh:MM'),
			fileName
		]);
	});
	
	console.log(table(filesArray, { align: ['l', 'r', 'r', 'r', 'l'] }));
}

// Does Windows has FIFOs, sockets and doors ?
function appendFileSuffix(fileName, fileStat) {
	if(!options.classify && !options["indicator-style"])
		return fileName;
	
	if(fileStat.isDirectory)
		fileName += chalk.reset("/");
		//return fileName + chalk.reset("/");
		//fileName = chalk.cyan(fileName) + "/";
	
	if(!options.classify)
		return fileName;
	
	// Doesn't work... (tested with mklink on Windows)
	if(fileStat.isSymbolicLink())
		fileName += chalk.reset("@");
	
	cleanedFileName = fileName.split('\\').pop().split('/').pop().toLowerCase();
	fileExt = (cleanedFileName.lastIndexOf(".") < 1) ? "" : cleanedFileName.substr(cleanedFileName.lastIndexOf(".") + 1);
	if(execFileExt.indexOf(fileExt) > -1)
		fileName = chalk.yellow(fileName) + "*";
	
	return fileName;
}

// Used with -l / --list for the files attributes
function getFileAttributes(filePath, simplifiedOutput) {
	try {
		var fileAttributes = winattr.getSync(filePath);
		if(simplifiedOutput) {
			var output = "";
			output += fileAttributes.archive ? "a" : "-"; //Compressed or compressable ?
			output += fileAttributes.hidden ? "h" : "-";
			output += fileAttributes.readonly ? "r" : "-";
			output += fileAttributes.system ? "s" : "-"; // Test C:\hiberfil.sys
			return output;
		} else {
			return fileAttributes;
		}
	} catch(err) {
		return (simplifiedOutput) ? "????" : false;
	}
}

function getFileStats(filePath) {
	try {
		var fileStats = fs.statSync(filePath);
		
		fileStats.isDirectory = Boolean(fileStats.isDirectory());
		
		if(options["human-readable"] && options.list)
			fileStats.size = prettyBytes(fileStats.size);
		
		return fileStats;
	} catch(err) {
		return false;
	}
}
