export function downloadPDF(pdfBase64: string) {
  const linkSource = `data:application/pdf;base64,${pdfBase64}`;
  const downloadLink = document.createElement('a');
  downloadLink.href = linkSource;
  downloadLink.download = 'template-preview.pdf';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink); // Cleanup
}
