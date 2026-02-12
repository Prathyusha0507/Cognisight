import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
   const user = await User.findById(req.userId);
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
