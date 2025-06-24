import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, ShoppingCart, Plus, Minus, Trash2, FileText, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const QRBarcodeScannerApp = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([
    { id: '1234567890123', name: 'Apple iPhone 15', price: 79900, gst_rate: 18, category: 'Electronics' },
    { id: '2345678901234', name: 'Samsung Galaxy Buds', price: 12990, gst_rate: 18, category: 'Electronics' },
    { id: '3456789012345', name: 'Nike Air Max Shoes', price: 8999, gst_rate: 12, category: 'Footwear' },
    { id: '4567890123456', name: 'Adidas T-Shirt', price: 1599, gst_rate: 12, category: 'Clothing' },
    { id: '5678901234567', name: 'Himalaya Face Wash', price: 125, gst_rate: 18, category: 'Cosmetics' },
    { id: '6789012345678', name: 'Tata Salt 1kg', price: 25, gst_rate: 0, category: 'Grocery' },
    { id: '7890123456789', name: 'Maggi Noodles', price: 12, gst_rate: 5, category: 'Food' },
    { id: '8901234567890', name: 'Parle-G Biscuits', price: 10, gst_rate: 5, category: 'Food' }
  ]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    gstin: '',
    address: '',
    phone: ''
  });
  const [businessInfo] = useState({
    name: 'ABC Electronics Store',
    gstin: '07AABCU9603R1ZM',
    address: '123 Business Street, Surat, Gujarat - 395003',
    phone: '+91 98765 43210'
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera for scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Simulate barcode/QR scanning (in a real app, you'd use a library like ZXing)
  const simulateScan = () => {
    const randomProductId = products[Math.floor(Math.random() * products.length)].id;
    setScannedData(randomProductId);
    processScannedData(randomProductId);
    stopCamera();
  };

  // Process scanned data
  const processScannedData = (data) => {
    const product = products.find(p => p.id === data);
    if (product) {
      addToCart(product);
    } else {
      alert(`Product not found for code: ${data}`);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Update quantity in cart
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculate bill totals
  const calculateBill = () => {
    let subtotal = 0;
    let totalGST = 0;
    const gstBreakdown = {};

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      const gstAmount = (itemTotal * item.gst_rate) / 100;
      totalGST += gstAmount;
      
      if (!gstBreakdown[item.gst_rate]) {
        gstBreakdown[item.gst_rate] = 0;
      }
      gstBreakdown[item.gst_rate] += gstAmount;
    });

    const total = subtotal + totalGST;

    return { subtotal, totalGST, total, gstBreakdown };
  };

  const { subtotal, totalGST, total, gstBreakdown } = calculateBill();
  
  const downloadPDF = () => {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("GST Invoice", 14, 15);

  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${Date.now()}`, 14, 25);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
  doc.text(`Time: ${new Date().toLocaleTimeString('en-IN')}`, 14, 35);

  doc.text("Business Info:", 14, 45);
  doc.text(`${businessInfo.name}`, 14, 50);
  doc.text(`GSTIN: ${businessInfo.gstin}`, 14, 55);
  doc.text(`${businessInfo.address}`, 14, 60);
  doc.text(`Phone: ${businessInfo.phone}`, 14, 65);

  doc.text("Customer Info:", 120, 45);
  doc.text(`${customerInfo.name}`, 120, 50);
  doc.text(`GSTIN: ${customerInfo.gstin || '-'}`, 120, 55);
  doc.text(`${customerInfo.address}`, 120, 60);
  doc.text(`Phone: ${customerInfo.phone}`, 120, 65);

  const tableData = cart.map(item => [
    item.name,
    item.quantity,
    item.price.toFixed(2),
    `${item.gst_rate}%`,
    (item.price * item.quantity).toFixed(2)
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Item', 'Qty', 'Price', 'GST', 'Total']],
    body: tableData
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 14, finalY);
  doc.text(`Total GST: ₹${totalGST.toFixed(2)}`, 14, finalY + 6);
  doc.setFontSize(12);
  doc.text(`Total Amount: ₹${total.toFixed(2)}`, 14, finalY + 14);

  // Open in a new tab
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, "_blank");
};

  // Generate bill
  const generateBill = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const billData = {
      billNo: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      customer: customerInfo,
      business: businessInfo,
      items: cart,
      totals: { subtotal, totalGST, total, gstBreakdown }
    };

    // In a real app, you would send this to a backend or generate PDF
    console.log('Generated Bill:', billData);
    alert('Bill generated successfully! Check console for details.');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setScannedData('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          QR/Barcode Scanner & GST Billing
        </h1>

        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Scan className="mr-2" />
            Scanner
          </h2>
          
          {!isScanning ? (
            <div className="text-center">
              <button
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center mx-auto"
              >
                <Camera className="mr-2" />
                Start Scanning
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-red-500 border-dashed m-8 rounded-lg pointer-events-none">
                  <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-red-500"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-red-500"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-red-500"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-red-500"></div>
                </div>
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={simulateScan}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Simulate Scan
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Stop Camera
                </button>
              </div>
            </div>
          )}

          {scannedData && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800">
                <strong>Scanned:</strong> {scannedData}
              </p>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="GSTIN (Optional)"
              value={customerInfo.gstin}
              onChange={(e) => setCustomerInfo({...customerInfo, gstin: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Address"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingCart className="mr-2" />
              Cart ({cart.length} items)
            </h2>
            <button
              onClick={clearCart}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Clear Cart
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty. Scan products to add them.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{item.price.toLocaleString('en-IN')} | GST: {item.gst_rate}% | Category: {item.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 bg-gray-100 rounded min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bill Summary */}
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calculator className="mr-2" />
              Bill Summary
            </h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              
              {/* GST Breakdown */}
              {Object.entries(gstBreakdown).map(([rate, amount]) => (
                amount > 0 && (
                  <div key={rate} className="flex justify-between text-sm text-gray-600">
                    <span>GST {rate}%:</span>
                    <span>₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                )
              ))}
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total GST:</span>
                <span>₹{totalGST.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <button
              // onClick={generateBill}
                onClick={downloadPDF}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <FileText className="mr-2" />
              Generate GST Bill
            </button>
          </div>
        )}

        {/* Available Products (for demo) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Products (Demo)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-xs text-gray-600">
                  ID: {product.id} | ₹{product.price} | GST: {product.gst_rate}%
                </p>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRBarcodeScannerApp;