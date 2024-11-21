import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserRoleSelection.css';

function UserRoleSelection() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/login');
  };

  return (
    <div className="user-role-selection-container">
      <div className="user-role-selection-content">
        <h1>WELCOME TO DONOR ~ CONNECT</h1>
        <h1>Who are you ?</h1>
        <div>
          <button onClick={handleButtonClick}>Hospital</button>
          <button onClick={handleButtonClick}>Person</button>
        </div>
      </div>
    </div>
  );
}

export default UserRoleSelection;
