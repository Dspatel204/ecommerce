import { Counter } from "./features/counter/Counter";
import "./styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter, Routes, Route, Switch } from "react-router-dom";
// import Cart from "./features/counter/Blogs";
import Cart from "./features/counter/CartPage";
import { BarcodeScanner } from "react-barcode-scanner";
import QRBarcodeBillingApp from "./features/counter/BillingApp";
export default function App() {
  return (
    <div className="App">
      <p>make a bil</p>
      <QRBarcodeBillingApp/>
      {/* <BarcodeScanner /> */}
      <Cart/>

      {/* <Counter /> */}
      {/* <Switch> */}
        <Routes>
        {/* <Route path="/" Component={<Counter />}></Route> */}
        {/* <Route path="addtocart" Component={<Cart />} /> */}
        </Routes>
      {/* </Switch>{" "} */}
    </div>
  );
} 
