'use client';
import 'grapesjs/dist/css/grapes.min.css';

import type { Editor } from 'grapesjs';
import grapesjs from 'grapesjs';
import React, { useEffect, useRef } from 'react';

const HtmlBuilder = () => {
  const editorRef = useRef<Editor>();

  useEffect(() => {
    if (!editorRef.current) {
      const editorInstance = grapesjs.init({
        container: '#gjs',
        storageManager: { autoload: false }, // No storage (for simplicity)
      });

      // Custom commands for toggling panels
      editorInstance.Commands.add('show-blocks', {
        run: () => {
          document.getElementById('blocks-panel')!.style.display = 'block';
          document.getElementById('layers-panel')!.style.display = 'none';
        },
      });

      editorInstance.Commands.add('show-layers', {
        run: () => {
          document.getElementById('blocks-panel')!.style.display = 'none';
          document.getElementById('layers-panel')!.style.display = 'block';
        },
      });

      // Add custom blocks for PDF generation
      const blockManager = editorInstance.BlockManager;

      // Header Section
      blockManager.add('header-block', {
        label: 'Header',
        content: `<header style="padding: 20px; text-align: center; font-size: 24px; background-color: #f4f4f4;">
                    <h1>Document Title</h1>
                  </header>`,
        category: 'PDF Elements',
      });

      // Text Block
      blockManager.add('text-block', {
        label: 'Text Block',
        content: `<div style="padding: 10px; font-size: 16px; line-height: 1.5; color: #333;">
                    <p>Enter your text here...</p>
                  </div>`,
        category: 'PDF Elements',
      });

      // Table Block
      blockManager.add('table-block', {
        label: 'Table',
        content: `<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                    <thead>
                      <tr style="background-color: #f4f4f4; text-align: left;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Column 1</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Column 2</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Column 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">Data 1</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Data 2</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Data 3</td>
                      </tr>
                    </tbody>
                  </table>`,
        category: 'PDF Elements',
      });

      // Image Block
      blockManager.add('image-block', {
        label: 'Image',
        content: `<div style="text-align: center; margin: 10px 0;">
                    <img src="https://via.placeholder.com/150" alt="Placeholder" style="max-width: 100%; height: auto;" />
                  </div>`,
        category: 'PDF Elements',
      });

      // Footer Section
      blockManager.add('footer-block', {
        label: 'Footer',
        content: `<footer style="padding: 10px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd;">
                    <p>Generated using PDF Builder</p>
                  </footer>`,
        category: 'PDF Elements',
      });

      editorRef.current = editorInstance;
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Main Editor Area */}
      <div id="gjs" className="flex-1" />
    </div>
  );
};

export default HtmlBuilder;
