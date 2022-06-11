import { createSlice } from "@reduxjs/toolkit";

export const darkLightMode = createSlice({
  name: "darkLightMode",
  initialState: {
    isDarkMode: true,
    backgroundColor_sub: "#ffffff",
    backgroundColor: "#f0f2f5",
    iconColor: "#65676b",
  },
  reducers: {
    isDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },

    backgroundColor: (state, action) => {
      if (!action.payload) {
        state.backgroundColor = "#ffffff";
      } else {
        state.backgroundColor = "#18191a";
      }
    },

    backgroundColor_sub: (state, action) => {
      if (!action.payload) {
        state.backgroundColor_sub = "#f0f2f5";
      } else {
        state.backgroundColor_sub = "#242526";
      }
    },

    iconColor: (state, action) => {
      if (action.payload) {
        state.iconColor = "#b0b3b8";
      } else {
        state.iconColor = "#65676b";
      }
    },
  },
});

export const { isDarkMode, backgroundColor, iconColor, backgroundColor_sub } =
  darkLightMode.actions;

export default darkLightMode.reducer;
