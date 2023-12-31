const router = require('express').Router();
const Post = require('../Models/PostModel');
const User = require('../Models/UserModel');

router.get('/', (req, res) => {
  res.send('This is Post Route');
});

// Create Post
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const SavedPost = await newPost.save();
    res.status(200).json(SavedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update Post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json('Post updated successfully');
    } else {
      res.status(403).json('You can update only your post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete Post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('Post deleted successfully');
    } else {
      res.status(403).json('You can delete only your post');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Like and Dislike a Post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('This Post has beed liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('Post has been disliked');
    }
  } catch (error) {}
});

// Get Post

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Timeline

router.get('/timeline/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPost = await Post.find({ userId: currentUser._id });
    const friendPost = await Promise.all(
      currentUser.following.map(friendId => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPost.concat(...friendPost));
  } catch (error) {
    res.status(500).json(error);
  }
});

// User's all posts

router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
