#!/usr/bin/env node
const path = require('path');
const puppeteer = require('puppeteer');

const argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 <html-file>')
    .example('$0 index.html', 'Convert index.html to index.pdf')
    .demandCommand(1)
    .parse();

const htmlFile = argv._[0];

(async function () {
	try {
		await generatePdf(htmlFile);
	} catch (e) {
		console.log(e);
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
