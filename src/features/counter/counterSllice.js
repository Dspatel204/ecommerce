import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    data:[]
  },
  reducers: {},
})

export const { adddata } = counterSlice.actions
export default counterSlice.reducer
