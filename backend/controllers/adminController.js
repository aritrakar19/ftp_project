import User from '../models/User.js';
import Image from '../models/Image.js';
import Gallery from '../models/Gallery.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user', 'client'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated', user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grant user access to an image or gallery
// @route   POST /api/admin/access/grant
// @access  Private/Admin
export const grantAccess = async (req, res) => {
  const { userId, targetId, type } = req.body; // type: 'image' | 'gallery'

  try {
    const targetModel = type === 'gallery' ? Gallery : Image;
    const item = await targetModel.findById(targetId);
    
    if (!item) return res.status(404).json({ message: `${type} not found` });

    if (!item.allowedUsers.includes(userId)) {
      item.allowedUsers.push(userId);
      await item.save();
    }

    res.json({ message: 'Access granted successfully', allowedUsers: item.allowedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke user access to an image or gallery
// @route   POST /api/admin/access/revoke
// @access  Private/Admin
export const revokeAccess = async (req, res) => {
  const { userId, targetId, type } = req.body; // type: 'image' | 'gallery'

  try {
    const targetModel = type === 'gallery' ? Gallery : Image;
    const item = await targetModel.findById(targetId);
    
    if (!item) return res.status(404).json({ message: `${type} not found` });

    item.allowedUsers = item.allowedUsers.filter((id) => id.toString() !== userId);
    await item.save();

    res.json({ message: 'Access revoked successfully', allowedUsers: item.allowedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
