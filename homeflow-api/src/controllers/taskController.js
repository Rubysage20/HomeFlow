const Task = require('../models/Task');
const User = require('../models/User');
const Household = require('../models/Household');
const { autoSplitTasks } = require('../utils/taskSplitter');
const { processRewards } = require ('../utils/rewardSystem');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      estimatedMinutes,
      dueDate,
      priority,
      tags,
      recurring,
      allowedAssignees,
    } = req.body;

    // Verify user has a household
    if (!req.user.household) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a household to create tasks',
      });
    }

    const task = await Task.create({
      title,
      description,
      household: req.user.household,
      createdBy: req.user._id,
      estimatedMinutes,
      dueDate,
      priority: priority || 'medium',
      tags,
      recurring,
      allowedAssignees,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for household
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    if (!req.user.household) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a household',
      });
    }

    const { status, assignedTo, priority } = req.query;

    // Build filter
    const filter = { household: req.user.household };

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a specific user
// @route   GET /api/tasks/user/:userId
// @access  Private
exports.getTasksByUser = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.params.userId,
      status: { $in: ['assigned', 'in-progress'] },
    })
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify task belongs to user's household
    if (task.household.toString() !== req.user.household.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify task belongs to user's household
    if (task.household.toString() !== req.user.household.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify task belongs to user's household
    if (task.household.toString() !== req.user.household.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a task
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (
      task.assignedTo.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this task',
      });
    }

    task.status = 'completed';
    task.completedAt = Date.now();
    await task.save();

    const user = await User.findById(task.assignedTo);
    user.pointsTotal += task.points;
    user.currentStreak += 1;
    await user.save();

    // Process rewards (badges, milestones)
    const rewards = await processRewards(task.assignedTo);

    res.status(200).json({
      success: true,
      data: task,
      rewards: rewards,
      message: `Task completed! You earned ${task.points} points.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-assign tasks to household members
// @route   POST /api/tasks/auto-assign
// @access  Private (Admin only)
exports.autoAssignTasks = async (req, res, next) => {
  try {
    if (!req.user.household) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a household',
      });
    }

    // Verify user is admin
    const household = await Household.findById(req.user.household);
    const isAdmin = household.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can auto-assign tasks',
      });
    }

    // Run auto-split algorithm
    const result = await autoSplitTasks(req.user.household);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Swap task with another user
// @route   POST /api/tasks/:id/swap
// @access  Private
exports.swapTask = async (req, res, next) => {
  try {
    const { swapWithUserId } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify task is assigned to current user
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only swap your own tasks',
      });
    }

    // Update assignment
    task.assignedTo = swapWithUserId;
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task swap request sent successfully',
    });
  } catch (error) {
    next(error);
  }
};


