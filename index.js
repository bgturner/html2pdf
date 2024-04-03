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

async function generatePdf(htmlFile) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const filePath = path.join(__dirname, htmlFile);
    await page.goto(`file://${filePath}`);

    const pdfFilePath = getPdfName(filePath);

    await page.pdf({ path: pdfFilePath, format: 'letter' });

    await browser.close();
}

function getPdfName(htmlFile) {
    const basename = path.basename(htmlFile, '.html');
    return path.join(__dirname, `${basename}.pdf`);
}
