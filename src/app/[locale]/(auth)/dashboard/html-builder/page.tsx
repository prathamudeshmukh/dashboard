'use client';
import '@grapesjs/studio-sdk/style';

import StudioEditor, { StudioCommands, ToastVariant } from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

const savedHtml = {
  htmlContent: `
  <style>
        body { background: #f0f0f0; }
        h1 { color: #333; }
      </style>
      <div>
        <h1>Hello, GrapesJS!</h1>
        <p>Reusable content loaded from the server.</p>
      </div>`
  ,
};

const HtmlBuilder = () => {
  const [editor, setEditor] = useState<Editor>();

  const onReady = (editor: Editor) => {
    setEditor(editor);

    // Block Manager
    const blockManager = editor.BlockManager;

    // Remove specific blocks
    const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox,', 'radio'];
    blocksToRemove.forEach((blockId) => {
      if (blockManager.get(blockId)) {
        blockManager.remove(blockId);
      }
    });
  };

  const saveProject = () => {
    if (editor) {
      // Get HTML and inline CSS
      const html = editor.getHtml();
      const css = editor.getCss();
      const htmlContent = `
        <style>${css}</style>
        ${html}
      `;

      // save the html content
      savedHtml.htmlContent = htmlContent;

      editor.runCommand(StudioCommands.toastAdd, {
        id: 'save-success',
        header: 'Save Successful',
        content: 'Project saved successfully!',
        variant: ToastVariant.Success,
      });
    }
  };

  const loadProject = (projectData: any) => {
    if (editor && projectData) {
      // Extract CSS and HTML

      const tempEl = document.createElement('div');
      tempEl.innerHTML = projectData.htmlContent;

      const styleEl = tempEl.querySelector('style');
      const css = styleEl ? styleEl.innerHTML : '';
      const html = tempEl.innerHTML.replace(styleEl?.outerHTML || '', '').trim();

      // Load components and styles into the editor
      editor.setComponents(html);
      editor.setStyle(css);

      editor.runCommand(StudioCommands.toastAdd, {
        id: 'load-success',
        header: 'Project Loaded',
        content: 'The saved project has been loaded successfully!',
        variant: ToastVariant.Success,
      });
    }
  };

  return (
    <div>
      <StudioEditor
        style={{ height: '500px' }}
        onReady={onReady}
        options={{
          licenseKey: '',
          theme: 'light',
          pages: false,
          autoHeight: false,
          project: {
            type: 'web',
          },
        }}
      />
      <div className="mr-4 mt-5 flex justify-end p-1">
        <Button className="mr-2 rounded border px-2" onClick={saveProject}>
          Save Project
        </Button>

        <Button
          className="rounded border px-2"
          onClick={() => loadProject(savedHtml)}
        >
          Load Project
        </Button>
      </div>
    </div>
  );
};

export default HtmlBuilder;
