import React, { useState, useEffect } from 'react';
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
import { adddata } from './counterSllice';
export function Counter() {
  const dispatch = useDispatch();
  const [edit, setedit] = useState(false)
  const [id, setid] = useState()
  const [alldata, setalldata] = useState([]);
  const [initialValues, setinitialValues] = useState({
    bookmarkName: '',
    url: '',
  })
  const [errors, seterrors] = useState({
    bookmarkName: '',
    url: ''
  })
  useEffect(() => {
    // const data = localStorage?.getItem('alldata')
    // if(data){
    //   let olddata = localStorage.getItem('alldata')
    //   console.log(JSON.Parse(olddata))
    // }
  }, [])

  // const history = useHistory()
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      bookmarkName: Yup.string().required('bookmarkName is required'),
      url: Yup.string().required('url is required'),
    }),
    onSubmit: (values) => {
      console.log(values)
      setalldata([...alldata, values])
      formik.handleReset()
      handleClose()
    },
  })
  const handleChange = (e) => {
    const { name, value } = e.target
    setinitialValues({ ...initialValues, [name]: value })
  }
  const handleSubmit = () => {
    if (initialValues.bookmarkName.length > 1 && initialValues.url.length > 1) {
      setalldata([...alldata, initialValues])
      setinitialValues({
        bookmarkName: '',
        url: ''
      })
      handleClose();
      localStorage.setItem('alldata', JSON.stringify(alldata))
    } else {
      if (initialValues.bookmarkName.length < 1 && initialValues.url.length > 1) {
        seterrors({
          bookmarkName: 'please enter a bookmark name',
          url: ''
        })
      } else {
        seterrors({
          bookmarkName: 'please enter a bookmark name',
          url: 'please enter a url'
        })

      }

    }
  }

  const handleedit = (item, index) => {
    handleOpen()
    console.log(index)
    setedit(true)
    setinitialValues(item);
    setid(index);
  }

  console.log(alldata)
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
  const editdata = () => {
    const updatedItem = alldata.map((todo, Id) => {
      return Id === id ? initialValues : todo;
    });
    // set editing to false because this function will be used inside a onSubmit function - which means the data was submited and we are no longer editing
    setedit(false);
    // update the todos state with the updated todo
    handleClose();
    setinitialValues({
      bookmarkName: '',
      url: ''
    })
    setalldata(updatedItem);
  }


 /*  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'bookmarkName', headerName: 'bookmarkName', width: 130 },
    { field: 'url', headerName: 'url', width: 300 },
    { field: 'actions', headerName: 'actions', width: 400 }
  ];

  const rows = [
    {
      id: 1, bookmarkName: 'Snow', url: 'Jon', actions: <><IconButton onClick={() => {
        alldata.splice(index, 1)
        setalldata([...alldata])
      }} aria-label="delete">
        <DeleteOutline />
      </IconButton>
        <Button variant="contained" onClick={() => handleedit(item, index)}>
          Edit
        </Button>
      </>
    },
    { id: 2, bookmarkName: 'Lannister', url: 'Cersei' },
    { id: 3, bookmarkName: 'Lannister', url: 'Jaime' }
  ];
 */
  const handelchange = (e) => {
    const { name, value } = e.target;
    setdata({ ...data, [name]: value })
  }

  return (
    <div>
      <h1>book mark manager</h1>
      <div style={{ height: 400, width: '100%' }}>
        <table border={1} style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th>Bookmark Name</th>
              <th>Bookmark url</th>
              <th>actions</th>
            </tr>
            {alldata.map((item, index) => (
              <tr key={index}>
                <td>{item.bookmarkName}</td>
                <td>{item.url}</td>
                <td>
                  <IconButton onClick={() => {
                    alldata.splice(index, 1)
                    setalldata([...alldata])
                  }} aria-label="delete">
                    <DeleteOutline />
                  </IconButton>
                  <Button variant="contained" onClick={() => handleedit(item, index)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        /> */}
      </div>
      <div>
        <Button variant="contained" onClick={handleOpen}>Add a Bookmark</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <TextField
              fullWidth
              id="bookmarkName"
              name="bookmarkName"
              label="bookmarkName"
              variant="outlined"
              onChange={(e) => {
                handleChange(e);
                formik.handleChange(e)
              }}
              error={errors.bookmarkName}
              onBlur={formik.handleBlur}
              value={initialValues.bookmarkName}
              // error={formik.touched.bookmarkName && Boolean(formik.errors.bookmarkName)}
              helperText={formik.touched.bookmarkName && formik.errors.bookmarkName}
            />
            <br />
            <TextField
              fullWidth
              id="url"
              name="url"
              label="url"
              variant="outlined"
              onChange={(e) => { formik.handleChange(e); handleChange(e) }}
              onBlur={formik.handleBlur}
              value={initialValues.url}
              // error={errors.url}
              error={formik.touched.url && Boolean(formik.errors.url)}
              helperText={formik.touched.url && formik.errors.url}
            />
            <br />
            <div>
              {edit ? <Button variant="contained" onClick={editdata}>edit</Button> : <Button variant="contained" type="submit" onClick={handleSubmit}>
                Submit
              </Button>}
            </div>
          </Box>
        </Modal>
      </div>
    </div >
  );
}
