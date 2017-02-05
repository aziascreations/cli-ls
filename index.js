const fs = require('fs');
const path = require('path');
const cliArgs = require('command-line-args');
const cliUsage = require('command-line-usage');

// Declaring Options
const cliOptions = [
	{
		name: 'all',
		alias: 'a',
		description: 'do not ignore entries starting with .',
		type: Boolean
	},
	{
		name: 'almost-all',
		alias: 'A',
		description: 'do not list implied . and ..',
		type: Boolean
	},
	{
		name: 'recursive',
		alias: 'R',
		description: 'DESC',
		type: Boolean
	},
	{
		name: 'src',
		description: 'TEMP: folder to list.',
		type: String,
		//multiple: false,
		defaultOption: true
	},
	{
		name: 'help',
		description: 'display this help and exit',
		type: Boolean
	},
	{
		name: 'version',
		description: 'output version information and exit',
		type: Boolean
	}
];

// Declaring help text structure
// http://man7.org/linux/man-pages/man1/ls.1.html
const cliHelp = [
	{
		header: 'SYNOPSIS',
		content: 'ls [[italic]{OPTION}]... [[italic]{FILE}]...'
	},
	{
		header: 'DESCRIPTION',
		content: 'List information about the FILEs (the current directory by default).'
	},
	{
		header: 'OPTIONS',
		optionList: cliOptions
	},
	{
		header: 'EXIT STATUS',
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
			console.log("Error: Unknown option");
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

// TODO: Check if it is still needed after removing the src option.
var sourceFolder = (options.src == null) ? "./" : path.normalize(options.src);
if(!fs.existsSync(sourceFolder)) {
	console.log("Error: Invalid path (%s)", sourceFolder);
	process.exit(1); // Might change the exit code
}

//Using "C:" is acting strange.
//console.log(options);
//console.log(sourceFolder);

/*if(fs.existsSync(sourceFolder)) {
	console.log("Valid path");
} else {
	console.log("Invalid path");
}

sourceFolder = path.normalize(sourceFolder);
console.log(sourceFolder);

if(fs.existsSync(sourceFolder)) {
	console.log("Valid path");
} else {
	console.log("Invalid path");
}/**/

//console.log(fs.readdirSync(sourceFolder));

walkFolderContent(sourceFolder);

function walkFolderContent(dir) {
	//console.log("Directory: %s", dir);
	var files = getFolderContent(dir);
	var folders = [];
	var filelist = [];
	
	files.forEach(function(file) {
		if(fs.statSync(path.join(dir, file)).isDirectory()) {
			// --DIRECTORIES--
			if(options.recursive) {
				//console.log("A: %s -> %s", dir, file);
				folders.push(path.join(/*dir,*/ file));
			}
			filelist.push(path.join(/*dir,*/ file, "/"));
		} else {
			// --FILES--
			filelist.push(path.join(/*dir,*/ file));
		}
	});
	
	printFolderContent(dir, filelist);
	
	if(options.recursive) {
		folders.forEach(function(folder) {
			walkFolderContent(path.join(dir, folder));
		});
	}
}

//TEMP function, will be changed when adding -a,-A,... support
function getFolderContent(dir) {
	return fs.readdirSync(dir);
}

function printFolderContent(dir, filelist) {
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
		console.log(filelist.join(Array(separatorWidth).join(" ")));
	}
	
	console.log();
}
