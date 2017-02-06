const fs = require('fs');
const path = require('path');
const cliArgs = require('command-line-args');
const cliUsage = require('command-line-usage');
const chalk = require('chalk');
const supportsColor = require('supports-color');

// Declaring Options
const cliOptions = [
	{
		name: 'all',
		alias: 'a',
		description: 'Do not ignore entries starting with .',
		type: Boolean
	},
	{
		name: 'almost-all',
		alias: 'A',
		description: 'Do not list implied . and ..',
		type: Boolean
	},
	{
		name: 'debug',
		alias: 'd',
		description: 'TEMP: output some debug informations.',
		type: Boolean
	},
	{
		name: 'reverse',
		alias: 'r',
		description: 'Reverse order while sorting',
		type: Boolean
	},
	{
		name: 'recursive',
		alias: 'R',
		description: 'List subdirectories recursively',
		type: Boolean
	},
	{
		name: 'src',
		description: 'TEMP: folder(s) to list.',
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

// Declaring help text structure
const cliHelp = [
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

// [Parsing/Processing?] help text
const usage = cliUsage(cliHelp);

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
	process.exit(2);
}

// Help & Version things
if(options.help) {
	console.log(usage);
	process.exit(0);
}
if(options.version) {
	console.log("Version 0.0.1?");
	process.exit(0);
}
if(options.debug) {
	console.log("cli-ls debug:");
	
	console.log('Terminal basic color support: %s', supportsColor ? "yes" : "no");
	console.log('Terminal 256 colors support: %s', supportsColor.has256 ? "yes" : "no");
	console.log('Terminal truecolor support: %s', supportsColor.has16m ? "yes" : "no");
	console.log("Terminal size: %sx%s", process.stdout.columns, process.stdout.rows);
	
	console.log("Launch options: %s", JSON.stringify(options));
	process.exit(0);
}

// Setting "C:" as the src outputs a strange normalized path.
// TODO: Check if it is still needed after removing the src option.
var sourceFolder = (options.src == null) ? "./" : path.normalize(options.src);
if(!fs.existsSync(sourceFolder)) {
	console.log("Error: Invalid path (%s)", sourceFolder);
	process.exit(1); // Might change the exit code
}

walkFolderContent(sourceFolder);

function walkFolderContent(dir) {
	//console.log("Directory: %s", dir);
	var files = getFolderContent(dir);
	var folders = [];
	var filelist = [];
	var filecolor = []; //0-Folder 1-File
	
	files.forEach(function(file) {
		try {
			if(fs.statSync(path.join(dir, file)).isDirectory()) {
				// --DIRECTORIES--
				if(options.recursive) {
					folders.push(path.join(/*dir,*/ file));
				}
				filelist.push(path.join(/*dir,*/ file, "/"));
				filecolor.push(0);
			} else {
				// --FILES--
				filelist.push(path.join(/*dir,*/ file));
				filecolor.push(1);
			}
		} catch(err) {
		  //console.log(err.code); //TempFix - hyberfil.sys was causing an error.
		}
	});
	
	if(options.reverse) {
		filelist = filelist.reverse();
	}
	
	printFolderContent(dir, filelist, filecolor);
	
	if(options.recursive) {
		folders.forEach(function(folder) {
			walkFolderContent(path.join(dir, folder));
		});
	}
}

//TEMP function, will be changed when adding -a,-A,... support
//Throws an error when reading some protected folders (C:\Windows\...)
function getFolderContent(dir) {
	return fs.readdirSync(dir);
}

function printFolderContent(dir, filelist, filecolor) {
	if(options.recursive) {
		console.log("%s:", path.normalize(dir));
	}
	
	//I couldn't find a good module for this.
	var separatorWidth = 4;
	var promptWidth = process.stdout.columns;
	var maxWidth = 1; //Biggest file name
	var rawWidth = 1;
	
	filelist.forEach(function(file) {
		if(maxWidth < file.length+separatorWidth) {
			maxWidth = file.length+separatorWidth;
		}
		rawWidth += file.length;
	});
	
	//Coloring text
	for(var i=0; i<filelist.length; i++) {
		if(filecolor[i] == 0) {
			//Quick "fix"
			filelist[i] = chalk.cyan(filelist[i].slice(0, -1))+filelist[i].slice(-1);
		}
	}
	
	//Printing non-list text
	if(rawWidth+filelist.length*separatorWidth >= promptWidth) {
		// Multiple lines
		var filesPerLine = Math.floor((promptWidth-1) / maxWidth);
		
		for(var i=0; i<Math.ceil(filelist.length / filesPerLine); i++) {
			var line = " ";
			
			for(var j=0; j<filesPerLine; j++) {
				if(i*filesPerLine+j >= filelist.length) {
					continue;
				}
				line += filelist[i*filesPerLine+j];
				line += Array(maxWidth-(filelist[i*filesPerLine+j].length)).join(" ");
			}
			console.log(line);
		}
	} else {
		//Single Line
		console.log((options.recursive ? " " : "") + filelist.join(Array(separatorWidth).join(" ")));
	}
	
	// Causes a double line return at the end!
	console.log();
}
