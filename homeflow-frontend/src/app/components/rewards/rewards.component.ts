import { Component, OnInit } from '@angular/core';
import { RewardService } from '../../services/reward.service';
import { AuthService } from '../../services/auth.service';
import { Reward, Badge, RewardStats, LeaderboardEntry } from '../../models/models';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {
  rewards: Reward[] = [];
  availableBadges: Badge[] = [];
  stats: RewardStats | null = null;
  leaderboard: LeaderboardEntry[] = [];
  loading = true;
  selectedTab = 0;

  constructor(
    private rewardService: RewardService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRewards();
    this.loadStats();
    this.loadLeaderboard();
  }

  loadRewards(): void {
    this.rewardService.getUserRewards().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.rewards = response.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.rewardService.getAvailableBadges().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availableBadges = response.data;
        }
      }
    });
  }

  loadStats(): void {
    this.rewardService.getRewardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      }
    });
  }

  loadLeaderboard(): void {
    const householdId = this.authService.currentUserValue?.household;
    this.rewardService.getLeaderboard(householdId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leaderboard = response.data;
        }
      }
    });
  }

  get earnedBadges(): Reward[] {
    return this.rewards.filter(r => r.type === 'badge');
  }

  get milestones(): Reward[] {
    return this.rewards.filter(r => r.type === 'milestone');
  }

  get currentUserRank(): number {
    const userId = this.authService.currentUserValue?._id;
    const entry = this.leaderboard.find(e => e.userId === userId);
    return entry?.rank || 0;
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }
}