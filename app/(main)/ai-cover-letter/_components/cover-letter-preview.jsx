"use client";

import React from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import HomeButton from "@/components/HomeButton";
// Converts basic markdown to Word-compatible HTML
const markdownToHtml = (markdown) => {
  if (!markdown) return "";

  return markdown
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Line breaks / paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    // Wrap in paragraph
    .replace(/^(.+)/, "<p>$1")
    .replace(/(.+)$/, "$1</p>");
};

const downloadAsWord = (content, fileName = "cover-letter") => {
  try {
    const htmlContent = markdownToHtml(content);

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Cover Letter</title>
          <style>
            body {
              font-family: Calibri, Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              margin: 2cm;
              color: #000000;
            }
            h1 { font-size: 18pt; margin-bottom: 12pt; }
            h2 { font-size: 15pt; margin-bottom: 10pt; }
            h3 { font-size: 13pt; margin-bottom: 8pt; }
            p  { margin-bottom: 10pt; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    const blob = new Blob([wordHtml], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Sanitize filename to remove spaces
    link.download = `${fileName.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Cover letter downloaded as Word document!");
  } catch (error) {
    toast.error("Failed to download cover letter. Please try again.");
    console.error("Word download error:", error);
  }
};

const CoverLetterPreview = ({ content, jobTitle, companyName }) => {
  // Create a dynamic file name based on the job details
  const generatedFileName = jobTitle && companyName 
    ? `Cover_Letter_${jobTitle}_${companyName}`
    : "Cover_Letter";

  return (
    <div className="py-4 space-y-4">
      {/* Download Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => downloadAsWord(content, generatedFileName)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={!content}
        >
          <Download className="h-4 w-4" />
          Save as Word Document
        </Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <HomeButton />
        <div className="text-sm text-muted-foreground">
         Cover Letter Preview
      </div>

</div>
      {/* Preview */}
      <div className="border rounded-md overflow-hidden bg-background">
        <MDEditor value={content} preview="preview" height={700} />
      </div>
    </div>
  );
};

export default CoverLetterPreview;