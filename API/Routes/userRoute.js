const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../Models/UserModel');

// Update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = bcrypt.hash(req.body.password, salt);
      } catch (error) {
        res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
      res.status(200).json('Account has been updated Successfully ');
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can't update other account");
  }
});

// Delete the user

router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json('Account has been deleted Successfully ');
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can't delete other account");
  }
});

// Find the user

router.get('/', async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId ? await User.findById(userId) : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(err);
  }
});

// Get all friends
router.get('/friends/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.following.map(friendId => {
        return User.findById(friendId);
      })
    );

    let friendList = [];
    friends.map(friend => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(err);
  }
});

// Follow the user

router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res.status(200).json('You are following this user');
      } else {
        res.status(200).json('You already follow this user');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json('You can only follow other profile');
  }
});

// Unfollow the user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json('You are unfollow this user');
      } else {
        res.status(403).json('You already unfollow this user');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json('You can only unfollow other profile');
  }
});

module.exports = router;
