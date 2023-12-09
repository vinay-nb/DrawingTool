import { createSlice } from "@reduxjs/toolkit";
import { MENU_ITEMS, COLORS, CANVAS_COLORS } from "@/constants";

const initialState = {
  [MENU_ITEMS.PENCIL]: {
    color: COLORS.BLACK,
    size: 3,
    canvasColor: CANVAS_COLORS.PURPLE,
  },
  [MENU_ITEMS.ERASER]: {
    color: COLORS.WHITE,
    size: 3,
    canvasColor: CANVAS_COLORS.PURPLE,
  },
  [MENU_ITEMS.UNDO]: {},
  [MENU_ITEMS.REDO]: {},
  [MENU_ITEMS.DOWNLOAD]: {},
};

export const toolboxSlice = createSlice({
  name: "toolbox",
  initialState,
  reducers: {
    changeColor: (state, action) => {
      state[action.payload.item].color = action.payload.color;
    },
    changeBrushSize: (state, action) => {
      state[action.payload.item].size = action.payload.size;
    },
    changeCanvasColor: (state, action) => {
      state[action.payload.item].canvasColor = action.payload.canvasColor;
    },
  },
});

export const { changeColor, changeBrushSize, changeCanvasColor } =
  toolboxSlice.actions;
export default toolboxSlice.reducer;
