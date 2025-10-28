import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HouseholdService } from '../../services/household.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Household, User } from '../../models/models';

@Component({
  selector: 'app-household',
  templateUrl: './household.component.html',
  styleUrls: ['./household.component.css']
})
export class HouseholdComponent implements OnInit {
  household: Household | null = null;
  members: User[] = [];
  loading = true;
  inviteCode = '';

  constructor(
    private householdService: HouseholdService,
    private userService: UserService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadHousehold();
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get hasHousehold(): boolean {
    return !!this.currentUser?.household;
  }

  loadHousehold(): void {
    if (!this.hasHousehold) {
      this.loading = false;
      return;
    }

    this.householdService.getHousehold(this.currentUser!.household!).subscribe({
      next: (response) => {
        this.household = response.data || null;
      }
    });

    this.userService.getUsers().subscribe({
      next: (response) => {
        this.members = response.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  createHousehold(name: string, description: string): void {
    this.householdService.createHousehold({ name, description }).subscribe({
      next: (response) => {
        this.authService.updateCurrentUser({ household: response.data?._id });
        this.snackBar.open('Household created!', 'Close', { duration: 3000 });
        this.loadHousehold();
      }
    });
  }

  joinHousehold(): void {
    if (!this.inviteCode) return;
    this.householdService.joinHousehold(this.inviteCode).subscribe({
      next: (response) => {
        this.authService.updateCurrentUser({ household: response.data?._id });
        this.snackBar.open('Joined household!', 'Close', { duration: 3000 });
        this.loadHousehold();
      },
      error: () => this.snackBar.open('Invalid invite code', 'Close', { duration: 3000 })
    });
  }

  copyInviteCode(): void {
    if (this.household?.inviteCode) {
      navigator.clipboard.writeText(this.household.inviteCode);
      this.snackBar.open('Invite code copied!', 'Close', { duration: 2000 });
    }
  }
}
