const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Fallback: Extract text using pdf2json when pdf-parse fails
 * Handles PDFs with corrupted XRef entries or non-standard formats
 */
const extractWithPdf2Json = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          // pdf2json stores text in Pages -> Texts -> R -> T (URI-encoded)
          let fullText = "";
          if (pdfData && pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const run of textItem.R) {
                      let textSnippet = run.T;
                      try {
                        textSnippet = decodeURIComponent(run.T);
                      } catch (e) {
                        try {
                          textSnippet = unescape(run.T);
                        } catch (e2) {
                          textSnippet = run.T;
                        }
                      }
                      fullText += textSnippet + " ";
                    }
                  }
                }
              }
              fullText += "\n";
            }
          }
          resolve(fullText.trim());
        } catch (parseErr) {
          reject(new Error(`pdf2json text extraction failed: ${parseErr.message}`));
        }
      });

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(`pdf2json parsing error: ${errData.parserError || errData}`));
      });

      pdfParser.loadPDF(filePath);
    } catch (err) {
      reject(new Error(`pdf2json module error: ${err.message}`));
    }
  });
};

/**
 * Extracts raw text content from a PDF file.
 * Uses pdf-parse as primary, falls back to pdf2json for corrupted PDFs.
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromPDF = async (filePath) => {
  // Attempt 1: pdf-parse (fast, handles most standard PDFs)
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    if (data.text && data.text.trim().length > 10) {
      return data.text.trim();
    }
  } catch (error) {
    console.warn("pdf-parse failed, trying pdf2json fallback:", error.message);
  }

  // Attempt 2: pdf2json (handles corrupted XRef, non-standard PDFs)
  try {
    const text = await extractWithPdf2Json(filePath);
    if (text && text.trim().length > 10) {
      console.log("pdf2json fallback succeeded");
      return text.trim();
    }
  } catch (error) {
    console.warn("pdf2json fallback also failed:", error.message);
  }

  // Attempt 3: Raw buffer scan for readable text (last resort)
  try {
    const rawBuffer = fs.readFileSync(filePath);
    const rawText = rawBuffer
      .toString("utf-8")
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s{3,}/g, " ")
      .trim();
    
    // Look for readable content between PDF stream markers
    const streamMatches = rawText.match(/stream\s+([\s\S]*?)\s+endstream/g);
    if (streamMatches) {
      const readable = streamMatches
        .map(s => s.replace(/^stream\s+/, "").replace(/\s+endstream$/, ""))
        .filter(s => /[a-zA-Z]{3,}/.test(s))
        .join(" ")
        .trim();
      if (readable.length > 50) {
        console.log("Raw text extraction fallback succeeded");
        return readable;
      }
    }
  } catch (error) {
    console.warn("Raw text extraction failed:", error.message);
  }

  throw new Error("Could not extract text from PDF. The file may be scanned/image-based or corrupted.");
};

module.exports = { extractTextFromPDF };
