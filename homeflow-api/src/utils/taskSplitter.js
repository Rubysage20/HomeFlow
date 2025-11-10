const User = require('../models/User');
const Task = require('../models/Task');

/**
 * Smart Task Splitter Algorithm
 * Automatically assigns tasks to household members based on:
 * - Available time capacity (maxDailyMinutes)
 * - Current workload (assigned tasks)
 * - Task priority (urgent > high > medium > low)
 * - Due date urgency (sooner = higher priority)
 * - Allowed assignees (if specified)
 */

const autoSplitTasks = async (householdId) => {
  try {
    // Get all open/unassigned tasks for the household
    const openTasks = await Task.find({
      household: householdId,
      status: 'open',
      assignedTo: null,
    }).sort({ priority: -1, dueDate: 1 }); // Sort by priority and due date

    if (openTasks.length === 0) {
      return {
        success: true,
        message: 'No open tasks to assign',
        assignments: [],
      };
    }

    // Get all active members in the household
    const members = await User.find({
      household: householdId,
      isActive: true,
    });

    if (members.length === 0) {
      return {
        success: false,
        message: 'No active members in household',
      };
    }

    // Calculate current workload for each member
    const memberWorkloads = await Promise.all(
      members.map(async (member) => {
        const assignedTasks = await Task.find({
          household: householdId,
          assignedTo: member._id,
          status: { $in: ['assigned', 'in-progress'] },
        });

        const totalMinutes = assignedTasks.reduce(
          (sum, task) => sum + task.estimatedMinutes,
          0
        );

        return {
          userId: member._id,
          name: member.name,
          maxDailyMinutes: member.maxDailyMinutes,
          currentMinutes: totalMinutes,
          availableMinutes: member.maxDailyMinutes - totalMinutes,
          taskCount: assignedTasks.length,
        };
      })
    );

    // Priority weights for scoring
    const priorityWeights = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    // Assignment results
    const assignments = [];

    // Assign each task
    for (const task of openTasks) {
      // Filter eligible members who have capacity
      let eligibleMembers = memberWorkloads.filter(
        (m) => m.availableMinutes >= task.estimatedMinutes
      );

      // If task has allowed assignees, filter by them
      if (task.allowedAssignees && task.allowedAssignees.length > 0) {
        eligibleMembers = eligibleMembers.filter((m) =>
          task.allowedAssignees.some(
            (allowedId) => allowedId.toString() === m.userId.toString()
          )
        );
      }

      // If no one has capacity, assign to person with least workload anyway
      if (eligibleMembers.length === 0) {
        eligibleMembers = [...memberWorkloads];
      }

      // Calculate urgency score based on days until due
      const daysUntilDue = Math.max(
        0,
        Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      );
      const urgencyScore = daysUntilDue === 0 ? 10 : Math.max(1, 10 - daysUntilDue);

      // Score each eligible member
      const scoredMembers = eligibleMembers.map((member) => {
        // Factor 1: Available capacity (higher is better)
        const capacityScore = member.availableMinutes / member.maxDailyMinutes;

        // Factor 2: Current task count (lower is better)
        const workloadScore = 1 / (member.taskCount + 1);

        // Factor 3: Priority weight
        const priorityScore = priorityWeights[task.priority] || 2;

        // Combined score (weighted average)
        const totalScore =
          capacityScore * 0.4 +      // 40% weight on available time
          workloadScore * 0.3 +      // 30% weight on task balance
          (urgencyScore / 10) * 0.3; // 30% weight on urgency

        return {
          ...member,
          score: totalScore,
        };
      });

      // Sort by score (highest first) and select best member
      scoredMembers.sort((a, b) => b.score - a.score);
      const bestMember = scoredMembers[0];

      // Update task in database
      task.assignedTo = bestMember.userId;
      task.status = 'assigned';
      await task.save();

      // Update member workload for next iteration
      const memberIndex = memberWorkloads.findIndex(
        (m) => m.userId.toString() === bestMember.userId.toString()
      );
      memberWorkloads[memberIndex].currentMinutes += task.estimatedMinutes;
      memberWorkloads[memberIndex].availableMinutes -= task.estimatedMinutes;
      memberWorkloads[memberIndex].taskCount += 1;

      // Record assignment
      assignments.push({
        taskId: task._id,
        taskTitle: task.title,
        assignedTo: bestMember.name,
        assignedToId: bestMember.userId,
        estimatedMinutes: task.estimatedMinutes,
        priority: task.priority,
        dueDate: task.dueDate,
      });
    }

    return {
      success: true,
      message: `Successfully assigned ${assignments.length} tasks`,
      assignments,
      memberWorkloads, // Return updated workloads for review
    };
  } catch (error) {
    console.error('Auto-split error:', error);
    return {
      success: false,
      message: 'Error in auto-split algorithm',
      error: error.message,
    };
  }
};

module.exports = { autoSplitTasks };
