import { MENU_ITEMS } from "@/constants";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionItemClick } from "@/slice/menuSlice";

import { socket } from "@/socket";

const Board = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const drawHistory = useRef([]);
  const historyPointer = useRef(0);
  const shoudlDraw = useRef(false);
  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size, canvasColor } = useSelector(
    (state) => state.toolbox[activeMenuItem]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const url = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "sketch.jpg";
      anchor.click();
    } else if (
      (actionMenuItem === MENU_ITEMS.UNDO ||
        actionMenuItem === MENU_ITEMS.REDO) &&
      historyPointer.current > 0
    ) {
      if (historyPointer.current > 0 && actionMenuItem === MENU_ITEMS.UNDO) {
        historyPointer.current -= 1;
      }
      if (
        historyPointer.current < drawHistory.current.length - 1 &&
        actionMenuItem === MENU_ITEMS.REDO
      ) {
        historyPointer.current += 1;
      }
      const imageData = drawHistory.current[historyPointer.current];
      context.putImageData(imageData, 0, 0);
    }

    dispatch(actionItemClick(null));
  }, [actionMenuItem]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const changeConfig = (color, size, canvasColor) => {
      context.strokeStyle = color;
      context.lineWidth = size;
      // context.fillStyle = canvasColor;
      // context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    };

    const handleChangeConfig = (config) => {
      changeConfig(config.color, config.size);
    };

    changeConfig(color, size, canvasColor);
    socket.on("changeConfig", handleChangeConfig);

    return () => {
      socket.off("changeConfig", handleChangeConfig);
    };
  }, [color, size, canvasColor]);

  // before browser paint
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
    };

    const drawLine = (x, y) => {
      context.lineTo(x, y);
      context.stroke();
    };

    const handleMouseDown = (e) => {
      shoudlDraw.current = true;
      beginPath(e.clientX, e.clientY);
      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
      if (!shoudlDraw.current) return;
      drawLine(e.clientX, e.clientY);
      socket.emit("drawLine", { x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e) => {
      shoudlDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    const handleBeginPath = (path) => {
      beginPath(path.x, path.y);
    };

    const handleBDrawLine = (path) => {
      drawLine(path.x, path.y);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    socket.on("beginPath", handleBeginPath);
    socket.on("drawLine", handleBDrawLine);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      socket.off("beginPath", handleBeginPath);
      socket.off("drawLine", handleBDrawLine);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
};

export default Board;
