import React from 'react';
import './Header.css'; 

const Footer = () => {
  return (
    <div style={{ 
      position: 'fixed',
      bottom: '0',
      left: '0',
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '0 12px 15px 12px', 
      width: '100%'
    }}>
      <div className="island" style={{ 
        justifyContent: 'center', 
        height: '60px', 
        borderRadius: '20px',
      }}>
        <img 
          src="/splitflow.png" 
          alt="Splitflow" 
          style={{ height: '24px', opacity: 0.8 }} 
        />
      </div>
    </div>
  );
};

export default Footer;