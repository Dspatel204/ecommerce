import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import Slider from "react-slick";

export default function Cart() {
  const [allProducts, setAllProducts] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [active, setActive] = useState(false);
  const [bookmarkName, setBookmarkName] = useState("");
  const [url, setUrl] = useState("");

  const handleToggleModal = useCallback(() => setActive((prev) => !prev), []);
  const handleAddToCart = (item) => {
    if (!cartData.some((i) => i.id === item.id)) {
      setCartData([...cartData, item]);
    }
  };
  const handleRemoveFromCart = (id) => {
    setCartData(cartData.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/products");
        setAllProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 700,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Product Store
      </Typography>

      <Button variant="contained" color="primary" onClick={handleToggleModal}>
        View Cart ({cartData.length})
      </Button>

      {/* Product Grid */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {allProducts.map((item) => (
          <Box
            key={item.id}
            sx={{
              width: 200,
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              textAlign: "center",
            }}
          >
            <img
              src={item.images[0]}
              alt={item.title}
              style={{ width: "100%", height: 120, objectFit: "cover" }}
            />
            <Typography variant="h6">{item.title}</Typography>
            <Typography color="text.secondary">${item.price}</Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              {item.description.slice(0, 50)}...
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleAddToCart(item)}
            >
              Add to Cart
            </Button>
          </Box>
        ))}
      </Box>

      {/* Modal with Cart */}
      <Modal
        open={active}
        onClose={handleToggleModal}
        aria-labelledby="cart-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="cart-modal-title" variant="h6" gutterBottom>
            Cart Items
          </Typography>

          {/* Form */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Bookmark Name"
              fullWidth
              variant="outlined"
              value={bookmarkName}
              onChange={(e) => setBookmarkName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="URL"
              fullWidth
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Box>

          {/* Carousel */}
          {cartData.length === 0 ? (
            <Typography color="text.secondary">No items in cart.</Typography>
          ) : (
            <Slider {...sliderSettings}>
              {cartData.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    textAlign: "center",
                    mx: 1,
                  }}
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                  />
                  <Typography variant="subtitle1">{item.title}</Typography>
                  <Typography>${item.price}</Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Slider>
          )}

          <Box sx={{ textAlign: "right", mt: 3 }}>
            <Button onClick={handleToggleModal}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
