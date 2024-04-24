#!/usr/bin/env node
const path = require('path');
const chokidar = require('chokidar');
const puppeteer = require('puppeteer');

const argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 <html-file>')
    .example('$0 index.html', 'Convert index.html to index.pdf')
    .example('$0 index.html -w', 'Watch for changes to index.html and regenerate index.pdf')
    .demandCommand(1)
    .option('watch', {
        alias: 'w',
        describe: 'Watch the html file for changes and regenerate the pdf',
        type: 'boolean'
    })
    .parse();

const htmlFile = argv._[0];
const shouldWatch = argv.watch;

(async function () {
	try {
        if (shouldWatch) {
            chokidar.watch(htmlFile)
                .on('ready', () => console.log(`Watching for changes to ${htmlFile}...`))
                .on('add', generatePdf)
                .on('change', (htmlFile) => {
                    console.log('File changed. Regenerating pdf...');
                    generatePdf(htmlFile);
                })
                .on('unlink', () => {
                    console.log('File removed. Stopping watching...');
                    process.exit(1);
                });
        } else {
            await generatePdf(htmlFile);
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
