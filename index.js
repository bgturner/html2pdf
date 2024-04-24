#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const puppeteer = require('puppeteer');

const argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 <html-file>')
    .example('$0 index.html', 'Convert index.html to index.pdf')
    .example('$0 index.html -w', 'Generate a pdf called index.pdf from index.html. Watch for changes to any files in the same directory as index.html and regenerate the pdf when changes are detected.')
    .demandCommand(1)
    .option('watch', {
        alias: 'w',
        describe: 'Watch for changes to files in the same directory as the html file and regenerate the pdf when changes are detected.',
        type: 'boolean'
    })
    .parse();

const htmlFilepath = path.resolve(path.normalize(argv._[0]));
const workingDir = path.dirname(htmlFilepath);
const pdfFilepath = getPdfPath(htmlFilepath);

if (!fs.existsSync(htmlFilepath)) {
    console.error(`Error: File not found: ${htmlFilepath}`);
    process.exit(1);
}

const shouldWatch = argv.watch;

(async function () {
	try {
        if (shouldWatch) {
            chokidar.watch(workingDir, { ignored: pdfFilepath})
                .on('ready', () => console.log(`Watching for changes in ${workingDir}...`))
                .on('add', () => generatePdf(htmlFilepath, pdfFilepath))
                .on('change', (path) => {
                    const logDateTimestamp = new Date().toISOString();
                    console.log(`[${logDateTimestamp}] Regenerating pdf. File changed: ${path}`);
                    generatePdf(htmlFilepath, pdfFilepath);
                })
                .on('unlink', (path) => {
                    if (path === htmlFilepath) {
                        console.log('Exiting... Html file removed: ', path);
                        process.exit(1);
                    }
                    console.log('Regenerating pdf. File removed: ', path);
                    generatePdf(htmlFilepath, pdfFilepath);
                });
        } else {
            await generatePdf(htmlFilepath, pdfFilepath);
            process.exit(0);
        }
	} catch (e) {
		console.log(e);
        process.exit(1);
	}
})();

/**
 * Given an absolute path to an html file, generate a pdf file in the same directory.
 *
 * @param {string} htmlFilepath - The absolute path to the html file.
 * @param {string} [pdfFilepath] - The absolute path to the pdf file.
 *
 * @returns {Promise<void>}
 */
async function generatePdf(htmlFilepath, pdfFilepath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`file://${htmlFilepath}`);

    await page.pdf({ path: pdfFilepath, format: 'letter' });

    await browser.close();
}

/*
 * Given an absolute path to an html file, return the absolute path to the pdf file.
 *
 * @param {string} htmlFilepath - The absolute path to the html file.
 *
 * @returns {string} - The absolute path to the pdf file.
 */
function getPdfPath(htmlFilepath) {
    const basename = path.basename(htmlFilepath, '.html');
    const dirname = path.dirname(htmlFilepath);
    return path.join(dirname, `${basename}.pdf`);
}
