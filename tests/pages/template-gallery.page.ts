import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class TemplateGalleryPage {
  constructor(private readonly page: Page) {}

  async selectRandomTemplate(): Promise<string> {
    await this.page.getByTestId('template-card').first().waitFor({ state: 'visible' });
    const cards = await this.page.getByTestId('template-card').all();

    expect(cards.length).toBe(11);

    const randomIndex = Math.floor(Math.random() * cards.length);
    const name = await cards[randomIndex]?.getByTestId('template-name').textContent();
    await cards[randomIndex]?.getByTestId('use-template-button').click();
    return name as string;
  }
}
