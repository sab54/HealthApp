// Client/src/store/reducers/settingsReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { updateUserProfile } from '../actions/settingActions';


const initialState = {
    user: null,
    loading: false,
    error: null,
    success: false,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        SETTINGS_RESET: (state) => {
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase('UPDATE_PROFILE_REQUEST', (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase('UPDATE_PROFILE_SUCCESS', (state, action) => {
                state.user = action.payload;
                state.loading = false;
                state.success = true;
                state.error = null;
            })
            .addCase('UPDATE_PROFILE_FAIL', (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export const { SETTINGS_RESET } = settingsSlice.actions;
export default settingsSlice.reducer;
