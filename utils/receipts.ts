import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Bill } from '@/types';

export async function generateReceiptPDF(bill: Bill): Promise<string> {
  try {
    const items = bill.items.map(item => {
      const price = item.overriddenPrice || item.product.price;
      return `
        <tr>
          <td>${item.product.name}</td>
          <td>${item.quantity} ${item.product.unit}</td>
          <td>$${price.toFixed(2)}</td>
          <td>$${(price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const formattedDate = new Date(bill.date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Helvetica', sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .receipt-info {
              margin-bottom: 20px;
            }
            .receipt-info div {
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #f2f2f2;
              text-align: left;
              padding: 8px;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .summary {
              margin-top: 20px;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
              text-align: right;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
            }
            .void-stamp {
              position: absolute;
              top: 40%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 60px;
              color: rgba(255, 0, 0, 0.5);
              border: 10px solid rgba(255, 0, 0, 0.5);
              padding: 20px;
              border-radius: 10px;
              z-index: 1000;
              display: ${bill.voidStatus === 'voided' ? 'block' : 'none'};
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FAST BILLS</h1>
            <p>Supermarket Billing System</p>
          </div>

          <div class="void-stamp">VOID</div>
          
          <div class="receipt-info">
            <div><strong>Receipt #:</strong> ${bill.id.substring(0, 6)}</div>
            <div><strong>Date:</strong> ${formattedDate}</div>
            <div><strong>Cashier:</strong> ${bill.cashierName}</div>
            ${bill.customerName ? `<div><strong>Customer:</strong> ${bill.customerName}</div>` : ''}
            ${bill.customerPhone ? `<div><strong>Phone:</strong> ${bill.customerPhone}</div>` : ''}
            ${bill.voidStatus === 'voided' ? `
              <div style="color: red;"><strong>VOIDED BY:</strong> ${bill.voidedBy}</div>
              <div style="color: red;"><strong>REASON:</strong> ${bill.voidReason}</div>` : ''}
            ${bill.refundReference ? `<div style="color: #ff8c00;"><strong>Refund for Receipt:</strong> #${bill.refundReference.substring(0, 6)}</div>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items}
            </tbody>
          </table>
          
          <div class="summary">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span>$${bill.total.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Tax (10%):</span>
              <span>$${bill.tax.toFixed(2)}</span>
            </div>
            ${bill.discount > 0 ? `
              <div style="display: flex; justify-content: space-between;">
                <span>Discount:</span>
                <span>-$${bill.discount.toFixed(2)}</span>
              </div>` : ''}
            ${bill.changeDue ? `
              <div style="display: flex; justify-content: space-between;">
                <span>Cash Received:</span>
                <span>$${(bill.finalAmount + bill.changeDue).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Change Due:</span>
                <span>$${bill.changeDue.toFixed(2)}</span>
              </div>` : ''}
          </div>
          
          <div class="total">
            Total: $${bill.finalAmount.toFixed(2)}
          </div>
          
          <div style="margin-top: 20px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Payment Method:</span>
              <span>${bill.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>For any queries please contact support@fastbills.com</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw error;
  }
}

export async function shareReceipt(bill: Bill) {
  try {
    const pdfUri = await generateReceiptPDF(bill);
    
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing isn't available on your device");
      return;
    }
    
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `FastBills Receipt #${bill.id.substring(0, 6)}`,
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error("Error sharing receipt:", error);
    throw error;
  }
}
