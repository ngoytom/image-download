// Dependencies
const fs = require('fs');
// const path = require('path'); // Used to print fileName for tracking
const download = require('download');
const exif = require('exif-parser');

// File URL + Download Destination
const URL = 'downloadurl';
const DIR = `${__dirname}/dist`;

// Array to store file names
const files = [];

/**
 * downloadExtract uses the download library to retrieve a file at a specified URL.
 * Once the file is downloaded, the file is then extracted into a destination folder
 * in the local working repository.
 * @param url Absolute URL giving the location of the file
 * @param callback Runs the specified function right after completion of tasks in downloadExtract
 *
 */
async function downloadExtract(url, callback) {
    // Check if directory exists, if not create one
    if (!fs.existsSync(DIR)) {
        fs.mkdirSync('./dist');
    } else { // else delete directory, prevents overwriting issues
        fs.rmSync(DIR, { recursive: true, force: true });
        fs.mkdirSync('./dist');
    }

    await download(url, 'dist', { extract: true }); // (url, destination, decompress file), if extract is set to true, use decompress library to extract file content
    // const fileName = path.basename(url); // Retrieve file name
    // console.log(`${fileName} successfully downloaded and extracted!`);

    const { length } = fs.readdirSync(DIR); // Get the number of files in dist directory

    // Loop through each file in the dist directory and pass the file into
    // the callback function along with the length
    fs.readdirSync(DIR).forEach((file) => callback(file, length));
}

/**
 * getISO retrieves the file meta data and adds a new property 'name'. The file is then appended
 * to the files array. Once all files are added from the directory, the files array is sorted in
 * reverse order and then printed to the console.
 * @param fileName Current file being read and added to the files array
 * @param numOfFiles Total number of file in the dist directory
 */
function getISO(fileName, numOfFiles) {
    // Retrieve file metadata
    const buffer = fs.readFileSync(`${DIR}/${fileName}`);
    const parser = exif.create(buffer);
    const result = parser.parse();

    result.name = fileName; // Make a result name property to keep track of file name
    files.push(result); // Add file to the files array

    // Check how many files are in the dist directory ->
    // If all files are appended, sort in reverse order based on ISO values
    if (files.length === numOfFiles) {
        files.sort((a, b) => b.tags.ISO - a.tags.ISO);
        // console.log('ISO Speed of Image in Reverse Order:');
        for (let i = 0; i < numOfFiles; i += 1) { // Output to console
            // eslint-disable-next-line no-console
            console.log(files[i].name);
            console.log(files[i].tags.ISO);
        }
    }
}

// Execute program
downloadExtract(URL, (file, length) => getISO(file, length));

/**
 * Resources Used
 * https://nodejs.org/api/path.html
 * https://nodejs.org/api/fs.html
 * https://www.npmjs.com/package/download
 * https://www.npmjs.com/package/exif-parser
 */
