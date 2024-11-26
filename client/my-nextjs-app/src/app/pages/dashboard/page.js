'use client';

import { useUser } from '../../context/UserContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isClient, setIsClient] = useState(false); // State to handle client-side rendering
  const [formData, setFormData] = useState({
    role: '',
    incomeAllow: '',
    age: '',
    setAmount: ''
  });

  useEffect(() => {
    setIsClient(true); // Set to true after mounting on the client
  }, []);

  const emptyFields = () => {
    if (!userInfo?.role || !userInfo?.incomeAllow || !userInfo?.age || !userInfo?.setAmount) {
      setOpen(true); // Open the dialog if any field is empty
    }
  };

  useEffect(() => {
    if (userInfo) {
      emptyFields();
    }
  }, [userInfo]);

  const getUser = async () => {
    const response = await fetch(`http://localhost:8080/api/user/${user.username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${user.token}`,
      }
    });

    const data = await response.json();
    if (response.ok) {
      setUserInfo(data);
    }
  };

  useEffect(() => {
    if (user.token) {
      getUser();
    }
  }, [user]);

  const editUser = async () => {
    const response = await fetch(`http://localhost:8080/api/user/edit/${user.username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${user.token}`,
      },
      body: JSON.stringify(formData), // Send form data in the request body
    });

    const data = await response.json();
    if (response.ok) {
      setUserInfo(data); // Update userInfo after successful edit
      setOpen(false); // Close the dialog
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Update the respective field
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editUser(); // Call the editUser function when the form is submitted
  };

  if (!userInfo) {
    return null; // Prevent rendering until the component is mounted on the client
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={(e, reason) => { if (reason !== 'backdropClick') setOpen(false); }} // Prevent closing on backdrop click
      >
        <DialogTitle>Edit Information</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label="Income Allowance"
            name="incomeAllow"
            value={formData.incomeAllow}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label="Age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            label="Set Amount"
            name="setAmount"
            value={formData.setAmount}
            onChange={handleChange}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} type="submit">Submit</Button>
        </DialogActions>
      </Dialog>

      <h1>Welcome, {user.username}!</h1>
      <p>Your email: {user.email}</p>
      <p>Your token: {user.token}</p>
      <p>{userInfo.role}</p>
      <p>{userInfo.incomeAllow}</p>
      <p>{userInfo.age}</p>
      <p>{userInfo.setAmount}</p>
    </div>
  );
}
