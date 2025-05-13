'use client';

import '@grapesjs/studio-sdk/style';

import { useUser } from '@clerk/nextjs';
import StudioEditor from '@grapesjs/studio-sdk/react';
import type { Editor } from 'grapesjs';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useTemplateStore } from '@/libs/store/TemplateStore';

export default function HTMLBuilder() {
  const { user } = useUser();
  const [editor, setEditor] = useState<Editor>();
  const { htmlContent, setHtmlContent, setHtmlStyle } = useTemplateStore();

  const containerRef = useRef(null);

  useEffect(() => {
    const loadTemplateData = async () => {
      if (!htmlContent) {
        return;
      }

      // Load the template data into the editor
      editor?.setComponents(htmlContent);
    };

    if (editor) {
      loadTemplateData();
    }
  }, [editor, htmlContent]);

  const onReady = (editor: Editor) => {
    setEditor(editor);

    // Save HTML content when editor changes
    const updateContent = debounce(() => {
      const html = editor.getHtml();
      const css = editor.getCss();
      setHtmlContent(html);
      setHtmlStyle(css as string);
    }, 500); // adjust debounce timing

    editor.on('update', updateContent);

    // Block Manager
    const blockManager = editor.BlockManager;

    // Remove specific blocks
    const blocksToRemove = ['video', 'form', 'input', 'textarea', 'select', 'button', 'checkbox,', 'radio', 'label'];
    blocksToRemove.forEach((blockId) => {
      if (blockManager.get(blockId)) {
        blockManager.remove(blockId);
      }
    });

    // Check if canvas is empty and add placeholder
    if (editor.getComponents().length === 0) {
      editor.setComponents(`
            <div id="placeholder" style="text-align: center; padding: 50px; font-size: 18px; color: #aaa;">
              ✨ Click on <strong>"+"</strong> to get started!
            </div>
          `);
    }

    // Listen for component add event to remove placeholder
    editor.on('component:add', () => {
      const placeholder = editor?.Components?.getWrapper()?.find('#placeholder');
      if (placeholder?.length) {
        placeholder[0]?.remove();
      }
    });
  };

  return (
    <div className="flex w-full flex-col space-y-4">
      <div className="m-0 w-full rounded-md border p-0">
        <div className="gjs-editor-cont w-full">
          {/* GrapesJS StudioEditor container */}
          <div ref={containerRef} className="h-[700px] w-full">
            <StudioEditor
              onReady={onReady}
              options={{
                licenseKey: process.env.NEXT_PUBLIC_GRAPE_STUDIO_KEY as string,
                theme: 'light',
                pages: false,
                autoHeight: false,
                devices: { selected: 'desktop' },
                settingsMenu: false,
                project: {
                  type: 'web',
                  id: uuidv4(),
                },
                identity: {
                  id: user?.id,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
