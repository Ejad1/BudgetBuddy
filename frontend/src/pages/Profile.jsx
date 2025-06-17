import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [pictureMessage, setPictureMessage] = useState('');
  const [pictureError, setPictureError] = useState('');
  const [isPictureLoading, setIsPictureLoading] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [preferencesError, setPreferencesError] = useState('');
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.profilePictureUrl) {
      setProfilePicturePreview(user.profilePictureUrl);
    }
    if (user?.currency) {
        setSelectedCurrency(user.currency);
    }
  }, [user]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    setIsPasswordLoading(true);

    if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long');
        setIsPasswordLoading(false);
        return;
    }

    try {
      const response = await axios.put('/api/auth/updatepassword', { 
        currentPassword, 
        newPassword 
      });
      setPasswordMessage(response.data.message || 'Password updated successfully!');
      setCurrentPassword(''); 
      setNewPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please check current password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEmailEditToggle = () => {
    setIsEditingEmail(!isEditingEmail);
    setEmail(user.email);
    setEmailMessage('');
    setEmailError('');
  };

  const handleEmailSave = async () => {
    if (email === user.email) {
      setIsEditingEmail(false);
      return;
    }
    setIsEmailLoading(true);
    setEmailMessage('');
    setEmailError('');
    try {
      const response = await axios.put('/api/user/email', { email });
      setEmailMessage(response.data.message || 'Email updated successfully!');
      if (setUser && response.data.user) {
        setUser(response.data.user);
      }
      setIsEditingEmail(false);
    } catch (err) {
      console.error('Email update failed:', err);
      setEmailError(err.response?.data?.message || 'Failed to update email.');
    } finally {
      setIsEmailLoading(false);
    }
  };
  
  const handlePictureSave = async () => {
    if (!profilePictureFile) {
        setPictureError("Please select an image first.");
        return;
    }
    setIsPictureLoading(true);
    setPictureMessage('');
    setPictureError('');
    const formData = new FormData();
    formData.append('profilePicture', profilePictureFile);

    try {
        const response = await axios.put('/api/user/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setPictureMessage(response.data.message || 'Profile picture updated!');
        if (setUser && response.data.user) {
             setUser(response.data.user);
        }
        if(response.data.user && response.data.user.profilePictureUrl) {
            setProfilePicturePreview(response.data.user.profilePictureUrl);
        }
        setProfilePictureFile(null);
        
    } catch (err) {
        console.error('Picture update failed:', err);
        setPictureError(err.response?.data?.message || 'Failed to update picture.');
    } finally {
        setIsPictureLoading(false);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setProfilePictureFile(file);
        setProfilePicturePreview(URL.createObjectURL(file));
        setPictureError('');
    }
  };

  const handlePreferencesSave = async () => {
    setIsPreferencesLoading(true);
    setPreferencesMessage('');
    setPreferencesError('');
    try {
      const response = await axios.put('/api/user/preferences', { currency: selectedCurrency });
      setPreferencesMessage(response.data.message || 'Preferences updated!');
      if (setUser && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Preferences update failed:', err);
      setPreferencesError(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setIsPreferencesLoading(false);
    }
  };

  return (
    <>
      <h1 className="dashboard-title">Profile</h1>
      <div className="page-content-centered profile-page-container">
        <div className="profile-section">
           <h2 className="section-title">Account Information</h2>
           {user ? (
            <div style={{marginTop: '1.5rem'}}>
              <p><strong>Username:</strong> {user.username}</p>
              <div className="email-display-edit">
                {isEditingEmail ? (
                  <>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input"
                      style={{ marginRight: '10px', width: '250px' }}
                      disabled={isEmailLoading}
                    />
                    <button onClick={handleEmailSave} className="auth-button" style={{width:'auto', marginRight:'5px'}} disabled={isEmailLoading}>
                      {isEmailLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handleEmailEditToggle} className="auth-button cancel-button" style={{width:'auto'}} disabled={isEmailLoading}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p style={{marginTop: '0.5rem'}}><strong>Email:</strong> {user.email}</p>
                    <button onClick={handleEmailEditToggle} className="auth-button edit-btn" style={{width:'auto', marginLeft: '15px'}}>Edit</button>
                  </>
                )}
              </div>
              {emailMessage && <p style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>{emailMessage}</p>}
              {emailError && <p style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>{emailError}</p>}
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>

        <hr className="profile-divider" />

        <div className="profile-section">
          <h2 className="section-title">Profile Picture</h2>
          <div className="profile-picture-area">
            {profilePicturePreview && (
              <img src={profilePicturePreview} alt="Profile Preview" className="profile-picture-preview" />
            )}
            <input type="file" accept="image/*" onChange={handlePictureChange} id="profilePictureInput" style={{display: 'none'}} disabled={isPictureLoading}/>
            <label htmlFor="profilePictureInput" className="auth-button choose-file-btn" style={{width:'auto', display:'inline-block', marginTop: '10px', marginRight: '10px'}} disabled={isPictureLoading}>
                Choose Image
            </label>
            {profilePictureFile && (
                 <button onClick={handlePictureSave} className="auth-button" style={{width:'auto'}} disabled={isPictureLoading}>
                    {isPictureLoading ? 'Uploading...' : 'Update Picture'}
                </button>
            )}
          </div>
          {pictureMessage && <p style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>{pictureMessage}</p>}
          {pictureError && <p style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>{pictureError}</p>}
        </div>
        
        <hr className="profile-divider" />

        <div className="profile-section">
          <h2 className="section-title">Preferences</h2>
          <div className="preference-item">
            <label htmlFor="currencySelect">Default Currency:</label>
            <select 
                id="currencySelect" 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="auth-input"
                style={{width: '150px', marginLeft: '10px', marginRight: '10px'}}
                disabled={isPreferencesLoading}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="XAF">XAF (FCFA)</option>
            </select>
            <button onClick={handlePreferencesSave} className="auth-button" style={{width:'auto'}} disabled={isPreferencesLoading}>
                {isPreferencesLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
          {preferencesMessage && <p style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>{preferencesMessage}</p>}
          {preferencesError && <p style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>{preferencesError}</p>}
        </div>

        <hr className="profile-divider" />

        <div className="profile-section">
          <h2 className="section-title">Change Password</h2>
          
          {passwordMessage && <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>{passwordMessage}</p>}
          {passwordError && <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{passwordError}</p>}

          <form onSubmit={handlePasswordSubmit} style={{marginTop: '1rem', maxWidth: '500px'}}>
            <div className="form-grid" style={{gridTemplateColumns: '150px 1fr'}}>
              <label htmlFor="currentPassword">Current Password:</label>
              <input 
                type="password" 
                id="currentPassword" 
                className="auth-input" 
                placeholder="********" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isPasswordLoading}
              />
            </div>
            <div className="form-grid" style={{gridTemplateColumns: '150px 1fr'}}>
              <label htmlFor="newPassword">New Password:</label>
              <input 
                type="password" 
                id="newPassword" 
                className="auth-input" 
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                disabled={isPasswordLoading}
              />
            </div>
             <button 
               type="submit"
               className="auth-button" 
               style={{width: 'auto', float: 'right'}} 
               disabled={isPasswordLoading}
             >
               {isPasswordLoading ? 'Updating...' : 'Update Password'}
             </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile; 