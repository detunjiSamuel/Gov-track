const PDFJS = require("pdfjs-dist");

const getPageText = async (pdf, pageNo) => {
    const page = await pdf.getPage(pageNo);
    const tokenizedText = await page.getTextContent();
    const pageText = tokenizedText.items.map(token => token.str).join("\n");
    return pageText;
};

const getPDFText = async function (source) {
    const pdf = await PDFJS.getDocument(source).promise;
    const maxPages = pdf.numPages;
    const pageTextPromises = [];

    // iterate through page numbers
    for (let i = 1; i <= maxPages; i += 1) {
        pageTextPromises.push(getPageText(pdf, i));
    }

    const pageTexts = await Promise.all(pageTextPromises);
    return pageTexts.join(" ");
};

// Driver
async function readPDF(buffer) {
    const text = await getPDFText({ data: buffer });
    return text;
}

module.exports = readPDF;