'use client';

import { useState, type ReactElement } from 'react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';

interface PDFDownloadButtonProps {
  document: ReactElement<DocumentProps>;
  fileName: string;
  children: React.ReactNode;
}

export function PDFDownloadButton({
  document,
  fileName,
  children,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : children}
    </Button>
  );
}
