const Task = require('../models/Task');
const User = require('../models/User');
const Household = require('../models/Household');
const {sendTaskAssignmentEmail, sendTaskCompletionEmail} = require('../services/emailService');
// Auto-assign algorithm - assigns task to member with lowest points
const autoAssignTask = async (householdId) => {
  try {
    const household = await Household.findById(householdId)
      .populate('members.user', 'points');
    
    if (!household || household.members.length === 0) {
      return null;
    }

    // Find member with lowest points
    const sortedMembers = household.members
      .filter(member => member.user) // Filter out null users
      .sort((a, b) => a.user.points - b.user.points);
    
    return sortedMembers[0]?.user._id || null;
  } catch (error) {
    console.error('Auto-assign error:', error);
    return null;
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (admin only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, priority, points, dueDate, assignedTo } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.household) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a household to create tasks'
      });
    }
    // Check is the user is household admin/head
    const household = await Household.findById(user.household);
    const member = household.members.find(m => m.user.toString() === req.user.id);
    
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the household head can create tasks'
      });
    }

    // Auto-assign if no user specified or if assignedTo is empty/invalid
    let taskAssignedTo = null;
    
    if (assignedTo && assignedTo !== '' && assignedTo !== 'undefined') {
      taskAssignedTo = assignedTo;
    } else {
      taskAssignedTo = await autoAssignTask(user.household);
    }

    // Build task data object - only include assignedTo if it has a valid value
    const taskData = {
      title,
      description,
      category,
      priority,
      points: points || 10,
      dueDate,
      household: user.household,
      createdBy: req.user.id
    };

    // Only add assignedTo if it's a valid ObjectId
    if (taskAssignedTo) {
      taskData.assignedTo = taskAssignedTo;
    }

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Send email notification if task is assigned
    if (populatedTask.assignedTo) {
      try {
        await sendTaskAssignmentEmail(
          populatedTask.assignedTo.email,
          populatedTask.assignedTo.name,
          populatedTask
        );
      } catch (error) {
        console.error('Failed to send task assignment email:', error);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// @desc    Get all tasks for household
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.household) {
      return res.json({
        success: true,
        tasks: []
      });
    }

    const tasks = await Task.find({ household: user.household })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Handle assignedTo field - remove if invalid
    const updateData = { ...req.body };
    
    if (updateData.assignedTo === '' || updateData.assignedTo === 'undefined' || updateData.assignedTo === null) {
      delete updateData.assignedTo;
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('createdBy', 'name email');

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};
// @desc    Complete task
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Task is already completed'
      });
    }

    // Update task status
    task.status = 'completed';
    task.completedAt = new Date();
    task.completedBy = req.user.id;
    await task.save();

    // Award points to user
      const assignedUserId = task.assignedTo || req.user.id; // Default to current user if not assigned
    const user = await User.findById(assignedUserId);
    user.points += task.points;
    
    // Check for level up (every 100 points = 1 level)
    const newLevel = Math.floor(user.points / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    // Update streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0) : 0;
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      user.streakDays += 1;
    } else if (daysDiff > 1) {
      user.streakDays = 1;
    }
    user.lastActiveDate = new Date();

    await user.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('completedBy', 'name email');

    // Send email notification to household members
    try {
      const household = await Household.findById(task.household).populate('members.user');
      if (household) {
        for (const member of household.members) {
          if (member.user && member.user._id.toString() !== req.user.id) {
            await sendTaskCompletionEmail(
              member.user.email,
              member.user.name,
              populatedTask,
              user.name
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send task completion emails:', error);
    }

    res.json({
      success: true,
      task: populatedTask,
      pointsEarned: task.points,
      newLevel: user.level,
      newPoints: user.points,
      streakDays: user.streakDays
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing task',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};
