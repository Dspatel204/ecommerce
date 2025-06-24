import React, { useState, useRef, useEffect } from 'react';
import { Camera, ShoppingCart, Plus, Minus, Trash2, Download, Calculator, Package, Receipt } from 'lucide-react';

const QRBarcodeBillingApp = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    gstin: ''
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    address: '123 Business Street, City, State - 123456',
    gstin: '22AAAAA0000A1Z5',
    phone: '+91 9876543210'
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Sample product database (in real app, this would come from your backend)
  const productDatabase = {
    '123456789012': {
      name: 'Premium Tea Bags',
      price: 250,
      gstRate: 5,
      hsn: '0902',
      unit: 'pack'
    },
    '987654321098': {
      name: 'Organic Coffee Beans',
      price: 450,
      gstRate: 5,
      hsn: '0901',
      unit: 'kg'
    },
    '456789123456': {
      name: 'Smartphone Case',
      price: 799,
      gstRate: 18,
      hsn: '3926',
      unit: 'piece'
    },
    '789123456789': {
      name: 'Wireless Earbuds',
      price: 2499,
      gstRate: 18,
      hsn: '8518',
      unit: 'pair'
    },
    '321654987321': {
      name: 'Notebook Set',
      price: 180,
      gstRate: 12,
      hsn: '4820',
      unit: 'set'
    }
  };

  // Mock barcode detection (in real app, use a library like ZXing or QuaggaJS)
  const detectBarcode = (imageData) => {
    // Simulate barcode detection
    const mockBarcodes = Object.keys(productDatabase);
    return mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      alert('Camera access denied or not available');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Mock scanning result
      const barcode = detectBarcode();
      if (barcode && productDatabase[barcode]) {
        addItemToCart(productDatabase[barcode], barcode);
        stopScanning();
      }
    }
  };

  const addItemToCart = (product, barcode) => {
    const existingItem = scannedItems.find(item => item.barcode === barcode);
    if (existingItem) {
      setScannedItems(items => 
        items.map(item => 
          item.barcode === barcode 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setScannedItems(items => [...items, {
        ...product,
        barcode,
        quantity: 1,
        id: Date.now()
      }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setScannedItems(items => items.filter(item => item.id !== id));
    } else {
      setScannedItems(items => 
        items.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const calculateBill = () => {
    let subtotal = 0;
    let totalGST = 0;
    const itemsWithCalculations = scannedItems.map(item => {
      const itemTotal = item.price * item.quantity;
      const gstAmount = (itemTotal * item.gstRate) / 100;
      subtotal += itemTotal;
      totalGST += gstAmount;
      return {
        ...item,
        itemTotal,
        gstAmount
      };
    });

    const grandTotal = subtotal + totalGST;
    
    setCurrentBill({
      items: itemsWithCalculations,
      subtotal,
      totalGST,
      grandTotal,
      billNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN')
    });
  };

  const downloadBill = () => {
    if (!currentBill) return;
    
    // Create a simple text bill (in real app, generate PDF)
    let billText = `
========== TAX INVOICE ==========
${companyInfo.name}
${companyInfo.address}
GSTIN: ${companyInfo.gstin}
Phone: ${companyInfo.phone}

Bill No: ${currentBill.billNumber}
Date: ${currentBill.date} ${currentBill.time}

Customer Details:
Name: ${customerInfo.name || 'Walk-in Customer'}
Phone: ${customerInfo.phone || 'N/A'}
GSTIN: ${customerInfo.gstin || 'N/A'}

================================
ITEMS:
`;

    currentBill.items.forEach(item => {
      billText += `
${item.name}
HSN: ${item.hsn} | Rate: ₹${item.price}
Qty: ${item.quantity} ${item.unit} | GST: ${item.gstRate}%
Amount: ₹${item.itemTotal.toFixed(2)}
GST: ₹${item.gstAmount.toFixed(2)}
--------------------------------`;
    });

    billText += `

SUMMARY:
Subtotal: ₹${currentBill.subtotal.toFixed(2)}
Total GST: ₹${currentBill.totalGST.toFixed(2)}
Grand Total: ₹${currentBill.grandTotal.toFixed(2)}

================================
Thank you for your business!
`;

    const blob = new Blob([billText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBill.billNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetBill = () => {
    setScannedItems([]);
    setCurrentBill(null);
    setCustomerInfo({ name: '', phone: '', address: '', gstin: '' });
  };

  // Mock add item for demo
  const addDemoItem = () => {
    const demoBarcode = Object.keys(productDatabase)[Math.floor(Math.random() * Object.keys(productDatabase).length)];
    addItemToCart(productDatabase[demoBarcode], demoBarcode);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
            <Receipt className="mr-3 text-blue-600" />
            QR/Barcode GST Billing System
          </h1>

          {/* Scanner Section */}
          <div className="mb-6">
            <div className="flex flex-col items-center">
              {!isScanning ? (
                <div className="text-center">
                  <button
                    onClick={startScanning}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mb-4"
                  >
                    <Camera className="mr-2" />
                    Start Scanning
                  </button>
                  <button
                    onClick={addDemoItem}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                  >
                    <Package className="mr-2" />
                    Add Demo Item
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-80 h-60 border-2 border-gray-300 rounded-lg bg-black"
                  />
                  <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-red-500 rounded-lg"></div>
                  </div>
                  <div className="flex justify-center mt-4 space-x-4">
                    <button
                      onClick={captureAndScan}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Capture & Scan
                    </button>
                    <button
                      onClick={stopScanning}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Stop Scanning
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Customer GSTIN (Optional)"
                  value={customerInfo.gstin}
                  onChange={(e) => setCustomerInfo({...customerInfo, gstin: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Scanned Items */}
          {scannedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ShoppingCart className="mr-2" />
                Scanned Items ({scannedItems.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Item</th>
                      <th className="border border-gray-300 p-2 text-center">HSN</th>
                      <th className="border border-gray-300 p-2 text-center">Rate</th>
                      <th className="border border-gray-300 p-2 text-center">Qty</th>
                      <th className="border border-gray-300 p-2 text-center">GST%</th>
                      <th className="border border-gray-300 p-2 text-center">Amount</th>
                      <th className="border border-gray-300 p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.barcode}</div>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{item.hsn}</td>
                        <td className="border border-gray-300 p-2 text-center">₹{item.price}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="mx-2 min-w-[30px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-green-600"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{item.gstRate}%</td>
                        <td className="border border-gray-300 p-2 text-center font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <button
                            onClick={() => updateQuantity(item.id, 0)}
                            className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={calculateBill}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Calculator className="mr-2" />
                  Generate GST Bill
                </button>
              </div>
            </div>
          )}

          {/* Generated Bill */}
          {currentBill && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Tax Invoice</h3>
                <div className="text-right">
                  <div className="font-semibold">Bill No: {currentBill.billNumber}</div>
                  <div className="text-sm text-gray-600">{currentBill.date} {currentBill.time}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">From:</h4>
                  <div className="text-sm">
                    <div className="font-medium">{companyInfo.name}</div>
                    <div>{companyInfo.address}</div>
                    <div>GSTIN: {companyInfo.gstin}</div>
                    <div>Phone: {companyInfo.phone}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">To:</h4>
                  <div className="text-sm">
                    <div className="font-medium">{customerInfo.name || 'Walk-in Customer'}</div>
                    <div>{customerInfo.phone || 'N/A'}</div>
                    <div>GSTIN: {customerInfo.gstin || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-300 py-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <div className="text-lg font-semibold">₹{currentBill.subtotal.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Subtotal</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">₹{currentBill.totalGST.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total GST</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹{currentBill.grandTotal.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Grand Total</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={downloadBill}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="mr-2" />
                  Download Bill
                </button>
                <button
                  onClick={resetBill}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  New Bill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRBarcodeBillingApp;