var exports = module.exports = {};

// Declaring "command-line-args" options
exports.cliOptions = [
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

// Executables file extensions
// Source: http://www.thepreparednesspodcast.com/quick-list-on-executable-file-extensions-updated/
exports.execFileExt = [
	//"action", //Mac OS
	//"apk", //Android
	//"app", //Mac OS
	"bat",
	"bin", //Mac OS, Linux
	"cmd",
	"com",
	//"command", //Mac OS
	"cpl",
	//"csh", //Mac OS, Linux
	"exe",
	"gadget",
	//"inf", //Windows -> Unsure
	"ins",
	"inx",
	//"ipa", //IOS
	"isu",
	"job",
	"jse",
	//"ksh", //Linux
	//"lnk", //Windows -> ??? symlink
	"msc",
	"msi",
	"msp",
	"mst",
	//"osx", //Mac OS
	//"out", //Linux
	"paf",
	"pif",
	//"prg", //GEM
	"ps1",
	"reg",
	"rgs",
	//"run", //Linux
	"sct",
	"sh",
	"shb",
	"shs",
	"u3p",
	"vb",
	"vbe",
	"vbs",
	"vbscript",
	//"workflow", //Mac OS
	"ws",
	"wsf"
];
