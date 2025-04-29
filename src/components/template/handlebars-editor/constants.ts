// Constants for the Handlebars Editor
export const DEFAULT_TEMPLATE = `<div class="invoice">
  <h1>{{company.name}}</h1>
  <div class="invoice-header">
    <div class="invoice-title">INVOICE</div>
    <div class="invoice-metadata">
      <div class="metadata-item">
        <span class="label">Invoice #:</span>
        <span class="value">{{invoice.number}}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Date:</span>
        <span class="value">{{invoice.date}}</span>
      </div>
    </div>
  </div>
  
  <div class="client-info">
    <h2>Bill To:</h2>
    <div>{{client.name}}</div>
    <div>{{client.address}}</div>
  </div>
  
  <table class="invoice-items">
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>{{unitPrice}}</td>
        <td>{{amount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  
  <div class="invoice-summary">
    <div class="summary-item">
      <span class="label">Subtotal:</span>
      <span class="value">{{totals.subtotal}}</span>
    </div>
    <div class="summary-item">
      <span class="label">Tax ({{totals.taxRate}}%):</span>
      <span class="value">{{totals.tax}}</span>
    </div>
    <div class="summary-item total">
      <span class="label">Total:</span>
      <span class="value">{{totals.total}}</span>
    </div>
  </div>
</div>`;

export const DEFAULT_STYLES = `
.invoice {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.invoice h1 {
  color: #333;
  margin-bottom: 5px;
}
.invoice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.invoice-title {
  font-size: 24px;
  font-weight: bold;
}
.metadata-item {
  margin: 5px 0;
}
.label {
  font-weight: bold;
}
.client-info {
  margin-bottom: 20px;
}
.invoice-items {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.invoice-items th, .invoice-items td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
.invoice-items th {
  background-color: #f2f2f2;
}
.invoice-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  width: 300px;
  margin-bottom: 5px;
}
.summary-item.total {
  font-weight: bold;
  margin-top: 10px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}
`;

export const PREVIEW_STYLES_PREFIX = `<style>`;
export const PREVIEW_STYLES_SUFFIX = `</style>`;
