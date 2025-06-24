import { Counter } from "./features/counter/Counter";
import "./styles.css";
import { BrowserRouter, Routes, Route, Switch } from "react-router-dom";
import Cart from "./features/counter/Blogs";
export default function App() {
  return (
    <div className="App">
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
