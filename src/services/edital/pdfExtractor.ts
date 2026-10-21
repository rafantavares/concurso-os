const pdfParse = require('pdf-parse');

export type PdfClassification = 'TEXT_PDF' | 'SCANNED_PDF' | 'MIXED_PDF' | 'UNKNOWN';

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  classification: PdfClassification;
  pages: PageContent[];
  totalWords: number;
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<ExtractionResult> {
  const pages: PageContent[] = [];
  let totalWords = 0;

  // Custom render page to capture text per page
  function render_page(pageData: any) {
    const render_options = {
      normalizeWhitespace: false,
      disableCombineTextItems: false
    };

    return pageData.getTextContent(render_options).then(function(textContent: any) {
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY){
            text += item.str;
        } else {
            text += '\n' + item.str;
        }    
        lastY = item.transform[5];
      }
      return text;
    });
  }

  const options = {
    pagerender: render_page
  };

  try {
    const data = await pdfParse(buffer, options);
    
    const pageTexts = data.text.split('\n\n');
    
    pageTexts.forEach((text: string, index: number) => {
      const trimmed = text.trim();
      if (trimmed) {
        pages.push({ pageNumber: index + 1, text: trimmed });
        totalWords += trimmed.split(/\s+/).length;
      }
    });

    // Classification Heuristic
    let classification: PdfClassification = 'TEXT_PDF';
    const numPages = data.numpages || pages.length;
    
    if (totalWords < numPages * 10) {
      classification = 'SCANNED_PDF';
    } else if (totalWords < numPages * 50) {
      classification = 'MIXED_PDF';
    }

    return {
      classification,
      pages,
      totalWords
    };
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return {
      classification: 'UNKNOWN',
      pages: [],
      totalWords: 0
    };
  }
}
