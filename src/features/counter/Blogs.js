// [import { LineAxisOutlined } from "@mui/icons-material";
import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios'
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { DeleteOutline, EditIcon } from '@mui/icons-material';

import { useFormik } from 'formik';
import { CssBaseline, Container } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
// import { useHistory } from 'react-router-dom'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField } from '@mui/material';
// import { adddata } from './counterSllice';
import Slider from "react-slick";
export default function Cart() {
    const [allproducts, setallproducts] = useState([])
    const [cartdata, setcartdata] = useState([]);
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const activator = <Button onClick={handleChange}>Open</Button>;


    const handlecartdata = (item) => {
        setcartdata([...cartdata, item])
    }
    useEffect(() => {
        return async () => {
            const data = await axios.get('https://dummyjson.com/products')
            console.log(data.data.products);
            if (data.data.products) {
                setallproducts([...data.data.products])
            }
        }
    }, [])

    const handlecart = (item, index) => {
        console.log(item, index)
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };
    const settings = {
        dots: true,
        infinite: true,
        height: 50,
        width: 50,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5
    };
    return (
        <div>
            {activator}
            <Modal
                open={active}
                onClose={handleChange}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} >
                    <TextField
                        fullWidth
                        id="bookmarkName"
                        name="bookmarkName"
                        label="bookmarkName"
                        variant="outlined"
                        onChange={(e) => {
                            handleChange(e);
                            // formik.handleChange(e)
                        }}
                    //   error={errors.bookmarkName}
                    //   onBlur={formik.handleBlur}
                    //   value={initialValues.bookmarkName}
                    // error={formik.touched.bookmarkName && Boolean(formik.errors.bookmarkName)}
                    //   helperText={formik.touched.bookmarkName && formik.errors.bookmarkName}
                    />
                    <br />
                    <TextField
                        fullWidth
                        id="url"
                        name="url"
                        label="url"
                        variant="outlined"
                    //   onChange={(e) => { formik.handleChange(e); handleChange(e) }}
                    //   onBlur={formik.handleBlur}
                    //   value={initialValues.url}
                    // error={errors.url}
                    //   error={formik.touched.url && Boolean(formik.errors.url)}
                    //   helperText={formik.touched.url && formik.errors.url}
                    />
                    <br />
                    {console.log(cartdata)}
                    <div>
                        <div id="carouselExampleSlidesOnly" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                {cartdata?.map((item, index) => (
                                    <div class="carousel-item"                                >
                                        {index < 5 &&
                                            <div className="card" key={index}>
                                                <img style={{ width: '50px', height: "50px" }} src={item.images[0]} alt="Denim Jeans" />
                                                <h1>{item.title}</h1>
                                                <p className="price">${item.price}</p>
                                                <p>{item.description}</p><p><button onClick={() => handlecart(item, index)}>Add to Cart</button></p>
                                            </div>
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
            {/* <div style={{ height: '500px' }}>
                <Frame>
                    <Modal
                        activator={activator}
                        open={active}
                        onClose={handleChange}
                        title="Reach more shoppers with Instagram product tags"
                        primaryAction={{
                            content: 'Add Instagram',
                            onAction: handleChange,
                        }}
                        secondaryActions={[
                            {
                                content: 'Learn more',
                                onAction: handleChange,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <TextContainer>
                                <p>
                                    Use Instagram posts to share your products with millions of
                                    people. Let shoppers buy from your store without leaving
                                    Instagram.
                                </p>
                            </TextContainer>
                        </Modal.Section>
                    </Modal>
                </Frame>
            </div> */}

            {console.log(allproducts)}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* <Slider {...settings}> */}
                {console.log(allproducts, '565')}
                {allproducts?.map((item, index) => (
                    <div className="card" key={index}>
                        <img style={{ width: '50px', height: "50px" }} src={item.images[0]} alt="Denim Jeans" />
                        <h1>{item.title}</h1>
                        <p className="price">${item.price}</p>
                        <p>{item.description}</p><p><button onClick={() => handlecart(item, index)}>Add to Cart</button></p>
                    </div>
                ))}
                {/* </Slider> */}
            </div>
        </div>
    )
}
