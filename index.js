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
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

        const filePath = path.join(__dirname, htmlFile);
        await page.goto(`file://${filePath}`);

        const pdfFilePath = getPdfName(filePath);

		await page.pdf({ path: pdfFilePath, format: 'letter' });

		await browser.close();
	} catch (e) {
		console.log(e);
	}
})();

function getPdfName(htmlFile) {
    const basename = path.basename(htmlFile, '.html');
    return path.join(__dirname, `${basename}.pdf`);
}
