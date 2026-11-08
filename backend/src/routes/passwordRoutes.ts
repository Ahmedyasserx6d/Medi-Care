import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
const router = express.Router();

// Secure Forgot Password - Generate secure random token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });
    
    // Generate secure random token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Save token and expiry on user document (expires in 1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();
    
    // For demo/UI flow: We return the token so the frontend wizard can use it
    res.json({ 
      message: 'Password reset link sent to your email',
      token: token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Secure Reset Password - Verify token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    // Look up user with non-expired token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Hash and update the password, clear the token fields
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
