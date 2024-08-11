import {program} from 'commander';
import fs from 'fs';
import path from 'path';
import { uniqueNamesGenerator, adjectives, colors, animals, names } from 'unique-names-generator';





/**
 * file-scrambler
 * @author: whirledsol
 * @date: 2024-08-11
 * scrambles file names in directory to unique names (with map)
 * 
	Usage: file-scrambler [options]

	scrambles file names in directory to unique names (with map)

	Options:
	-i,--directory <string>     directory to use
	-d,--dry-run                dry run/debug
	-w, --word-count <int>      number of words to use for random file name (default: 3)
	-s,--separator <string>     unique name separator (default: "-")
	--collision-attempts <int>  collision attempts (default: 10)
	--map-name <string>         map file name (default: "map")
	-r, --recursive             recurses through subfolders (NOT IMPLEMENTED)
	-h, --help                  display help for command

 */

program
	.description('scrambles file names in directory to unique names (with map)')
	.requiredOption('-i,--directory <string>','directory to use',)
	.requiredOption('-d,--dry-run','dry run/debug',)
	.option('-w, --word-count <int>','number of words to use for random file name',3)
	.option('-s,--separator <string>','unique name separator','-')
	.option('--collision-attempts <int>','collision attempts',10)
	.option('--map-name <string>','map file name','map')
	.option('-r, --recursive','recurses through subfolders (NOT IMPLEMENTED)');

program.parse();

const options = program.opts();
console.log('parsed options',options);
run(options);


/**
 * run
 * @param {*} options 
 */
async function run(options){


    // Our starting point
    try {
        // Get the files as an array
        const files = await fs.promises.readdir( options.directory );
		const map = {};

        // loop through files
        for( const file of files ) {

            const ext = path.extname(file);
            const fromPath = path.join( options.directory, file );

			for(let i=1; i<=options.collisionAttempts; i++)
			{
				const toFile = `${getRandomName(options)}${ext}`;
				const toPath = path.join( options.directory, toFile );
				const exists = await fileExists( toPath );
				if( !exists ){
					if(!options.dryRun){
						await fs.promises.rename( fromPath, toPath );
					}
					map[file] = toFile;
					break;
				}
				console.warning(`Could not rename ${file}`);
			}
        }

		//write map
		const mapFilePath = path.join(options.directory,`${options.mapName}.json`);
		await fs.promises.writeFile(mapFilePath, JSON.stringify(map,null,4));

    }
    catch( e ) {
        // Catch anything bad that happens
        console.error( "We've thrown! Whoops!", e );
    }
	console.info('All done! Visit', options.directory);
}

/**
 * 
 * @param {*} file 
 * @returns 
 */
async function fileExists(file) {
	return fs.promises.access(file, fs.constants.F_OK)
			 .then(() => true)
			 .catch(() => false)
  }

/**
 * getRandomName
 * @param {*} options 
 */
function getRandomName(options){
	const nouns = Boolean(Math.random() > 0.5) ? animals: names;
	return uniqueNamesGenerator({
		dictionaries: [colors, adjectives, nouns],
		separator: options.separator,
		length: options.wordCount
	});
}

