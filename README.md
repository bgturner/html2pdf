# html2pdf

A simple cli utility to generate a PDF from an HTML file using Puppeteer.

## Installation

Clone this repo, install the dependencies, and install globally:

```shell
git clone git@github.com:bgturner/html2pdf.git && cd html2pdf
npm install
npm install -g
```

## Usage

```shell
html2pdf --help
Usage: html2pdf <html-file>

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -w, --watch    Watch for changes to files in the same directory as the html
                 file and regenerate the pdf when changes are detected.[boolean]

Examples:
  html2pdf index.html     Convert index.html to index.pdf
  html2pdf index.html -w  Generate a pdf called index.pdf from index.html. Watch
                          for changes to any files in the same directory as
                          index.html and regenerate the pdf when changes are
                          detected.
```
