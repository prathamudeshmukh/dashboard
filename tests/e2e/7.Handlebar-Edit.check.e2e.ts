import { expect, test } from '@playwright/test';
import { parse } from 'node-html-parser';

import { getEditorContent, setEditorContent } from '../helpers/templateFlow';

test.use({
  permissions: ['clipboard-read', 'clipboard-write'], // allow clipboard access
});

test('Edit and publish handlebars template', async ({ page }) => {
  await page.goto('/Dashboard');

  // Find first row with 'handlebars-template' as Template Type
  const targetRow = page.locator('table tbody tr').filter({
    has: page.getByRole('cell', { name: 'handlebars-template' }),
  }).first();

  const templateId = await targetRow.getByRole('cell').nth(1).textContent();

  // Click the Actions button in that row (adjust nth() if needed)
  await targetRow.locator('button').nth(1).click();

  // Click on 'Edit'
  await page.getByRole('button', { name: 'Edit' }).click();

  // Find Frames of code editor and json editor
  const frame = page.frameLocator('iframe[title="Handlebar Editor"]');
  const codeEditor = frame.getByTestId('code-editor').getByRole('textbox', { name: 'Editor content' });
  const jsonEditor = frame.getByTestId('json-editor').getByRole('textbox', { name: 'Editor content' });

  // --- HTML Editor ---
  const existingHtml = await getEditorContent(page, codeEditor);

  // Parse the HTML content
  const root = parse(existingHtml as string);

  // Append new block to the body
  (root.querySelector('body') ?? root).append('<h1>Hello {{test.userName}}</h1>');
  await setEditorContent(page, codeEditor, root.toString().trim());

  // Get Existing JSON
  const existingJSON = await getEditorContent(page, jsonEditor);
  let json: Record<string, any> = {};
  try {
    json = existingJSON.trim() ? JSON.parse(existingJSON) : {};
  } catch {
    console.warn('Invalid JSON, resetting to {}');
  }

  // Add new value into JSON
  json.test = { userName: 'Templify' };
  await setEditorContent(page, jsonEditor, JSON.stringify(json));

  await page.getByRole('button', { name: 'Update & Publish' }).click();

  await targetRow.locator('button').nth(1).click();
  await page.getByRole('button', { name: 'Preview' }).click();

  await page.getByRole('tab', { name: 'javascript' }).click();
  const innerText = await page.locator('pre').allInnerTexts();

  expect(
    innerText.some(text => text.includes(templateId as string)),
  ).toBeTruthy();

  await page.close();
});
