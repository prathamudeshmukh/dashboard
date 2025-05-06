type DatasetExamples = Record<string, any>;

declare global {
  type Windows = {
    Handlebars?: typeof import('handlebars');
  };
}

export class HandlebarsService {
  private handlebars: typeof import('handlebars') | null;
  private initialized: boolean;
  private datasetExamples: DatasetExamples;

  constructor() {
    this.handlebars = null;
    this.initialized = false;
    this.datasetExamples = {
      default: {
        company: {
          name: 'Acme Corporation',
          address: '123 Business St, Suite 100, City, State 12345',
          phone: '(123) 456-7890',
        },
        invoice: {
          number: 'INV-001',
          date: 'March 30, 2025',
          dueDate: 'April 29, 2025',
        },
        client: {
          name: 'John Smith',
          address: '456 Client Ave, City, State 12345',
          email: 'john.smith@example.com',
        },
        items: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 75,
            amount: 3000,
          },
          {
            description: 'UI/UX Design',
            quantity: 20,
            unitPrice: 85,
            amount: 1700,
          },
        ],
        totals: {
          subtotal: 4700,
          taxRate: 8.5,
          tax: 399.5,
          total: 5099.5,
        },
      },
      minimal: {
        company: {
          name: 'ABC Company',
          address: '123 Main St',
          phone: '555-1234',
        },
        invoice: {
          number: 'INV-002',
          date: 'April 1, 2025',
          dueDate: 'April 15, 2025',
        },
        client: {
          name: 'Jane Doe',
          address: '789 Client St',
          email: 'jane@example.com',
        },
        items: [
          {
            description: 'Consulting',
            quantity: 5,
            unitPrice: 100,
            amount: 500,
          },
        ],
        totals: {
          subtotal: 500,
          taxRate: 5,
          tax: 25,
          total: 525,
        },
      },
      complete: {
        company: {
          name: 'Global Enterprises, Inc.',
          address: '1000 Corporate Blvd, Suite 500, Metropolis, NY 10001',
          phone: '(800) 555-1234',
          email: 'info@globalenterprises.com',
          website: 'www.globalenterprises.com',
          logo: 'logo.png',
        },
        invoice: {
          number: 'INV-2025-0103',
          date: 'March 15, 2025',
          dueDate: 'April 14, 2025',
          terms: 'Net 30',
          poNumber: 'PO-12345',
        },
        client: {
          name: 'Mega Corporation',
          attention: 'Accounts Payable',
          address: '500 Business Park, Tower 3, Floor 20, Business City, CA 90210',
          email: 'ap@megacorp.com',
          phone: '(213) 555-6789',
          id: 'CLIENT-001',
        },
        items: [
          {
            description: 'Strategic Consulting Services',
            details: 'Business strategy development and implementation planning',
            quantity: 40,
            unit: 'hours',
            unitPrice: 250,
            amount: 10000,
          },
          {
            description: 'Market Research Report',
            details: 'Comprehensive industry analysis and competitor benchmarking',
            quantity: 1,
            unit: 'report',
            unitPrice: 7500,
            amount: 7500,
          },
          {
            description: 'Executive Workshop',
            details: 'Full-day leadership workshop with executive team',
            quantity: 2,
            unit: 'days',
            unitPrice: 5000,
            amount: 10000,
          },
          {
            description: 'Implementation Support',
            details: 'Technical support and guidance during implementation phase',
            quantity: 25,
            unit: 'hours',
            unitPrice: 175,
            amount: 4375,
          },
        ],
        totals: {
          subtotal: 31875,
          discountRate: 10,
          discount: 3187.5,
          subtotalAfterDiscount: 28687.5,
          taxRate: 8.75,
          tax: 2510.16,
          shipping: 0,
          total: 31197.66,
        },
        payment: {
          method: 'Bank Transfer',
          details: 'Please transfer the amount to Account #: 9876543210, Routing #: 123456789, Bank: First National Bank',
          dueDate: 'April 14, 2025',
        },
        notes: 'Thank you for your business! Please include the invoice number in your payment reference.',
      },
    };
  }

  async initialize(): Promise<typeof import('handlebars') | null> {
    if (!this.initialized && typeof window !== 'undefined') {
      try {
        if (!window.Handlebars) {
          await this.loadHandlebarsFromCDN();
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        this.handlebars = window.Handlebars ?? null;

        if (this.handlebars) {
          this.handlebars.registerHelper('formatCurrency', (value: any) => {
            if (typeof value === 'number') {
              return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            }
            return value;
          });

          this.handlebars.registerHelper('formatDate', (value: any) => {
            if (!value) {
              return '';
            }
            try {
              const date = new Date(value);
              return date.toLocaleDateString();
            } catch (e) {
              return e;
            }
          });
        }

        this.initialized = true;

        return this.handlebars;
      } catch (error) {
        console.error('Error initializing Handlebars:', error);
        throw error;
      }
    }

    return this.handlebars;
  }

  async loadHandlebarsFromCDN(): Promise<typeof import('handlebars') | void> {
    return new Promise((resolve, reject) => {
      if (window.Handlebars) {
        resolve(window.Handlebars);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/handlebars@4.7.7/dist/handlebars.min.js';
      script.async = true;
      script.onload = () => {
        ;
        resolve(window.Handlebars);
      };
      script.onerror = (err) => {
        console.error('Failed to load Handlebars from CDN', err);
        reject(new Error('Failed to load Handlebars from CDN'));
      };
      document.head.appendChild(script);
    });
  }

  async renderTemplate(templateCode: string, jsonData: object | string): Promise<string> {
    try {
      const handlebars = await this.initialize();
      if (!handlebars) {
        console.error('Handlebars could not be initialized');
        return '<div>Error: Handlebars could not be initialized</div>';
      }

      let data: any;
      try {
        data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      } catch (jsonError: any) {
        console.error('JSON parsing error:', jsonError);
        return `<div class="text-red-500 p-4">JSON Error: ${jsonError.message}</div>`;
      }

      try {
        const template = handlebars.compile(templateCode);
        return template(data);
      } catch (templateError: any) {
        console.error('Template compilation error:', templateError);
        return `<div class="text-red-500 p-4">Template Error: ${templateError.message}</div>`;
      }
    } catch (error: any) {
      console.error('Error rendering template:', error);
      return `<div class="text-red-500 p-4">Error: ${error.message}</div>`;
    }
  }

  formatHandlebarsCode(code: string): string {
    const lines = code.split(/(\r?\n)/).join('').split(/(?<=>)/g); // Flatten & split by HTML tag ends
    const tokens = lines.flatMap(line => line.split(/(?=\{\{|\}\})/g)); // Split by handlebars blocks

    let indent = 0;
    const indentString = '  ';
    const output: string[] = [];

    for (const token of tokens) {
      const trimmed = token.trim();
      if (!trimmed) {
        continue;
      }

      if (trimmed.match(/^\{\{\/(if|each|unless|with)\}\}/)) {
        indent = Math.max(indent - 1, 0);
      }

      output.push(indentString.repeat(indent) + trimmed);

      if (trimmed.match(/^\{\{#(if|each|unless|with)(\s|\})/)) {
        indent += 1;
      }
    }

    return output.join('\n');
  }

  getDatasetJson(datasetId: string): any {
    return this.datasetExamples[datasetId] || this.datasetExamples.default;
  }
}
