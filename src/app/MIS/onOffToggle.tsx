import React, { useState } from 'react';

interface OnOffToggleProps {
    onToggleChange: (newState: boolean) => void;
  }

const OnOffToggle : React.FC<OnOffToggleProps> = ({ onToggleChange }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newIsOn = !isOn;
    setIsOn(newIsOn);
    onToggleChange(newIsOn); 
  };

  return (
    <label className={`toggle ${isOn ? 'on' : 'off'}`}>
      <input type="checkbox" onClick={handleToggle} />
      <span className="slider round"></span>
    </label>
  );
}

export default OnOffToggle;
