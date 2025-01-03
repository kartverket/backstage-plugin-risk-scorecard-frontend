import React from 'react';
import Alert from '@mui/material/Alert';
import { AlertProps } from '../../utils/types';

interface CustomAlertProps {
  alert: AlertProps | null;
  setAlert: React.Dispatch<React.SetStateAction<AlertProps | null>>;
}

export const CustomAlert = ({ alert, setAlert }: CustomAlertProps) => {
  return (
    alert && (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '40%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }}
      >
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      </div>
    )
  );
};
