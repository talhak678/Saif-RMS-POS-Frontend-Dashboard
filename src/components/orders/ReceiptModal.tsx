"use client";

import React, { useRef } from "react";
import { X, Printer } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function ReceiptModal({ isOpen, onClose, order }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt #${order.orderNo}</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 0; 
              margin: 0;
              color: #000;
              line-height: 1.3;
              -webkit-print-color-adjust: exact;
            }
            .receipt {
              width: 100%;
              max-width: 380px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
            }
            .logo {
              width: 60px;
              height: 60px;
              margin: 0 auto 5px;
              background: #f0f0f0;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 20px;
            }
            .restaurant-name {
              font-size: 18px;
              font-weight: 800;
              margin: 2px 0;
            }
            .order-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 15px;
              font-size: 12px;
            }
            .meta-item b {
              display: block;
              color: #666;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.5px;
            }
            .customer-section {
              border-top: 1px dashed #ccc;
              border-bottom: 1px dashed #ccc;
              padding: 10px 0;
              margin-bottom: 15px;
              font-size: 12px;
            }
            .customer-grid {
              display: flex;
              flex-direction: column;
            }
            .customer-grid div {
              display: flex;
              justify-content: space-between;
              width: 100%;
            }
            .customer-grid b {
              color: #444;
            }
            .items-section {
              margin-bottom: 15px;
            }
            .category-title {
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              color: #000;
              margin: 10px 0 5px;
              border-bottom: 1px solid #eee;
              padding-bottom: 3px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              font-size: 12px;
            }
            .item-details {
              display: flex;
              gap: 10px;
            }
            .item-qty {
              font-weight: 800;
            }
            .item-name {
              font-weight: 700;
            }
            .item-price {
              font-weight: 800;
            }
            .item-unit {
              font-size: 10px;
              color: #666;
            }
            .totals-section {
              border-top: 1px solid #000;
              padding-top: 10px;
              font-size: 13px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .grand-total {
              font-size: 16px;
              font-weight: 900;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #eee;
            }
            .footer {
              text-align: center;
              font-size: 9px;
              color: #777;
              margin-top: 20px;
              border-top: 1px solid #eee;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const groupedItems = order.items.reduce((acc: any, item: any) => {
    const catName = item.menuItem?.category?.name || "Other Items";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-4xl">
      <style>{`
        .receipt-preview {
          font-family: 'Inter', sans-serif;
          color: #000;
          line-height: 1.3;
        }
        .receipt-preview .receipt {
          width: 100%;
        }
        .receipt-preview .header {
          text-align: center;
          margin-bottom: 15px;
        }
        .receipt-preview .logo {
          width: 60px;
          height: 60px;
          margin: 0 auto 5px;
          background: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }
        .receipt-preview .restaurant-name {
          font-size: 18px;
          font-weight: 800;
          margin: 2px 0;
        }
        .receipt-preview .order-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
          font-size: 12px;
        }
        .receipt-preview .meta-item b {
          display: block;
          color: #666;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.5px;
        }
        .receipt-preview .customer-section {
          border-top: 1px dashed #ccc;
          border-bottom: 1px dashed #ccc;
          padding: 10px 0;
          margin-bottom: 15px;
          font-size: 12px;
        }
        .receipt-preview .customer-grid {
          display: flex;
          flex-direction: column;
        }
        .receipt-preview .customer-grid div {
          display: flex;
          justify-content: space-between;
        }
        .receipt-preview .customer-grid b {
          color: #444;
        }
        .receipt-preview .items-section {
          margin-bottom: 15px;
        }
        .receipt-preview .category-title {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: #000;
          margin: 10px 0 5px;
          border-bottom: 1px solid #eee;
          padding-bottom: 3px;
        }
        .receipt-preview .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .receipt-preview .item-details {
          display: flex;
          gap: 10px;
        }
        .receipt-preview .item-qty {
          font-weight: 800;
        }
        .receipt-preview .item-name {
          font-weight: 700;
        }
        .receipt-preview .item-price {
          font-weight: 800;
        }
        .receipt-preview .item-unit {
          font-size: 10px;
          color: #666;
        }
        .receipt-preview .totals-section {
          border-top: 1px solid #000;
          padding-top: 10px;
          font-size: 13px;
        }
        .receipt-preview .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .receipt-preview .grand-total {
          font-size: 16px;
          font-weight: 900;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #eee;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">Print Order</h2>
              <p className="text-xs text-gray-400 font-medium">Total: 1 sheet of paper</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row gap-12">

          {/* Controls Left */}
          <div className="w-full md:w-64 space-y-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Printer</label>
                <select className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-bold outline-none ring-brand-500 focus:ring-2">
                  <option>Microsoft Print to PDF</option>
                  <option>Thermal Printer (XP-80)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Copies</label>
                <input type="number" defaultValue={1} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-bold outline-none ring-brand-500 focus:ring-2" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePrint}
                className="w-full bg-brand-600 text-white font-black py-4 rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                Print Now
              </button>
              <button onClick={onClose} className="w-full bg-white dark:bg-gray-800 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                Cancel
              </button>
            </div>
          </div>

          {/* Receipt Preview Right */}
          <div className="flex-1 bg-white dark:bg-white shadow-xl min-h-[600px] max-w-[450px] mx-auto p-10 text-gray-800 receipt-preview" ref={printRef}>
            <div className="receipt">
              <div className="header">
                <div className="logo">
                  {order.branch?.name?.charAt(0) || "W"}
                </div>
                <h1 className="restaurant-name">{order.branch?.name || "Wahid Nimco Quetta"}</h1>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest">(Duplicate Receipt)</p>
              </div>

              <div className="order-meta">
                <div className="meta-item">
                  <b>Order ID :</b>
                  <span className="font-bold">#{order.orderNo}</span>
                </div>
                <div className="meta-item text-right">
                  <b>Order Time :</b>
                  <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <b>Delivery Time :</b>
                  <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-item text-right">
                  <b>Name :</b>
                  <span className="font-bold">{order.customer?.name || "N/A"}</span>
                </div>
              </div>

              <div className="customer-section">
                <div className="customer-grid">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <b className="whitespace-nowrap">Address :</b>
                    <span className="text-right font-medium text-gray-600 leading-tight flex-1">{order.deliveryAddress || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <b>City :</b>
                    <span className="font-medium text-gray-600">{order.branch?.city || "Quetta"}</span>
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <b>Phone No :</b>
                    <span className="font-bold">{order.customer?.phone || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <b>Payment Type :</b>
                    <span className="font-bold underline">{order.payment?.method || "CASH"}</span>
                  </div>
                </div>
              </div>

              <div className="items-section">
                {Object.keys(groupedItems).map(cat => (
                  <div key={cat}>
                    <h3 className="category-title">{cat}</h3>
                    {groupedItems[cat].map((it: any) => (
                      <div key={it.id} className="item-row">
                        <div className="item-details">
                          <span className="item-qty">{it.quantity}</span>
                          <div className="flex flex-col">
                            <span className="item-name">{it.menuItem.name}</span>
                            <span className="item-unit">Rs. {it.price}</span>
                          </div>
                        </div>
                        <span className="item-price">Rs. {it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="totals-section">
                <div className="total-row">
                  <span className="text-gray-500 font-medium">Sub Total</span>
                  <span className="font-bold">Rs. {order.total}</span>
                </div>
                <div className="total-row">
                  <span className="text-gray-500 font-medium">Delivery Fee ({order.type})</span>
                  <span className="font-bold">Rs. {order.deliveryCharge || 0}</span>
                </div>
                {order.loyaltyAmount > 0 && (
                  <div className="total-row" style={{ color: '#e67e22' }}>
                    <span>Loyalty Points Used</span>
                    <span className="font-bold">-Rs. {order.loyaltyAmount}</span>
                  </div>
                )}
                <div className="total-row grand-total flex justify-between">
                  <span className="font-black text-black">Due Amount :</span>
                  <span className="font-black text-black">Rs. {Number(order.total) + Number(order.deliveryCharge || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

