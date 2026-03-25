export function printOrderReceipt(order: any, restaurantLogo?: string) {
    const items = order?.items || [];
    const subtotal = items.reduce((s: number, i: any) => s + parseFloat(i.price) * i.quantity, 0);
    const date = new Date(order.createdAt).toLocaleString("en-PK", { hour12: true });

    let headerContent = `<div class="c b lg" style="margin-bottom: 10px;">RMS POS</div>`;
    if (restaurantLogo) {
        headerContent = `<div class="c"><img src="${restaurantLogo}" alt="Logo" style="max-height: 60px; object-fit: contain; margin: 0 auto 10px; display: block;" /></div>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:4mm 3mm;color:#000;background:#fff}
        .c{text-align:center}.b{font-weight:bold}.lg{font-size:16px}.sm{font-size:10px}
        .div{border-top:1px dashed #000;margin:4px 0}
        .row{display:flex;justify-content:space-between;margin:2px 0}
        .ri{display:flex;justify-content:space-between;margin:3px 0;align-items:flex-start}
        .tr{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin:4px 0}
        @media print{body{width:80mm}@page{margin:0;size:80mm auto}}
    </style></head><body>
    ${headerContent}
    <div class="c sm">Order Receipt</div>
    <div class="c sm">${date}</div>
    <div class="c b">Order #${order.orderNo || ''}</div>
    <div class="div"></div>
    <div class="row sm"><span>Type: <b>${(order.type || '').replace('_', ' ')}</b></span><span>Src: <b>${order.source || 'N/A'}</b></span></div>
    ${order.customerName ? `<div class="sm">Customer: <b>${order.customerName}</b></div>` : order.customer?.name ? `<div class="sm">Customer: <b>${order.customer.name}</b></div>` : ''}
    ${order.customer?.phone ? `<div class="sm">Phone: ${order.customer.phone}</div>` : ''}
    ${order.tableNumber ? `<div class="sm">Table: ${order.tableNumber}</div>` : ''}
    ${order.deliveryAddress ? `<div class="sm">Address: ${order.deliveryAddress}</div>` : ''}
    ${order.branch?.name ? `<div class="sm">Branch: ${order.branch.name}</div>` : ''}
    <div class="div"></div>
    <div class="ri b sm">
        <span style="flex:1;margin-right:4px">ITEM</span>
        <span style="min-width:20px;text-align:center">QTY</span>
        <span style="min-width:50px;text-align:right">PRICE</span>
    </div>
    <div class="div"></div>
    ${items.map((item: any) => `
        <div class="ri">
            <span style="flex:1;margin-right:4px">${item.menuItem?.name || 'Item'}</span>
            <span style="min-width:20px;text-align:center">${item.quantity}</span>
            <span style="min-width:50px;text-align:right">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
        </div>`).join('')}
    <div class="div"></div>
    <div class="row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="div"></div>
    <div class="tr"><span>TOTAL</span><span>$${parseFloat(order.total).toFixed(2)}</span></div>
    <div class="div"></div>
    <div class="c sm" style="margin-top:8px">Thank you! Please come again.</div>
    <div class="div" style="margin-top:10px"></div>
    <div class="c sm" style="margin-top:4px; font-size: 9px; opacity: 0.8;">Software Developed by <b>PlatterOS</b></div>
    <div class="c sm" style="font-size: 9px; opacity: 0.8;">Website: <b>www.platteros.com</b></div>
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
            }, 500);
        };
    </script>
    </body></html>`;

    const printWin = window.open("", "_blank", "width=1000,height=800,left=100,top=100");
    if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
    }
}
