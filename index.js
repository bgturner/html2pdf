#!/usr/bin/env node
const path = require('path');
const puppeteer = require('puppeteer');

const htmlFile = process.argv[2];

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
