import React, { useState } from "react";
import './Form.css'

const NewButton = (props) => {
  const [color, setColor] = useState("red");

  const changeColor = () => {
    setColor((prevColor) => (prevColor === "red" ? "green" : "red"));
  };

  return (
    <button className="availability" style={{ backgroundColor: color }} onClick={changeColor}></button>
  );
};

export default NewButton;
