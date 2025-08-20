
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    addEvent: (state, action) => {
      state.events.push(action.payload);
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setEvents, addEvent, setSelectedEvent, setLoading, setError } = eventSlice.actions;
export default eventSlice.reducer;
