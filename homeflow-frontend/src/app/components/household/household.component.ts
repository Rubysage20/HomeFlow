import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  submitting = false;
  
  // Form visibility flags
  showCreateForm = false;
  showJoinForm = false;
  
  // Forms
  createForm!: FormGroup;
  joinForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private householdService: HouseholdService,
    private userService: UserService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadHousehold();
  }

  initializeForms(): void {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    this.joinForm = this.fb.group({
      inviteCode: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get hasHousehold(): boolean {
    return !!this.currentUser?.household;
  }

  get activeMembers(): number {
    return this.members.filter(m => m.isActive).length;
  }

  get adminCount(): number {
    return this.members.filter(m => m.role === 'admin').length;
  }

  get totalPoints(): number {
    return this.members.reduce((sum, m) => sum + (m.pointsTotal || 0), 0);
  }

  loadHousehold(): void {
    if (!this.hasHousehold) {
      this.loading = false;
      return;
    }

    this.householdService.getHousehold(this.currentUser!.household!).subscribe({
      next: (response) => {
        this.household = response.data || null;
      },
      error: (error) => {
        console.error('Error loading household:', error);
        this.snackBar.open('Failed to load household', 'Close', { duration: 3000 });
      }
    });

    this.userService.getUsers().subscribe({
      next: (response) => {
        this.members = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.loading = false;
      }
    });
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) {
      return;
    }

    this.submitting = true;
    const { name, description } = this.createForm.value;

    this.householdService.createHousehold({ name, description }).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success && response.data) {
          // Update the current user's household
          this.authService.updateCurrentUser({ household: response.data._id });
          
          this.snackBar.open(' Household created successfully!', 'Close', { duration: 3000 });
          this.showCreateForm = false;
          this.createForm.reset();
          
          // Reload household data
          this.loading = true;
          this.loadHousehold();
        }
      },
      error: (error) => {
        this.submitting = false;
        const message = error.error?.message || 'Failed to create household';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  onJoinSubmit(): void {
    if (this.joinForm.invalid) {
      return;
    }

    this.submitting = true;
    const inviteCode = this.joinForm.value.inviteCode.toUpperCase();

    this.householdService.joinHousehold(inviteCode).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success && response.data) {
          // Update the current user's household
          this.authService.updateCurrentUser({ household: response.data._id });
          
          this.snackBar.open(' Successfully joined household!', 'Close', { duration: 3000 });
          this.showJoinForm = false;
          this.joinForm.reset();
          
          // Reload household data
          this.loading = true;
          this.loadHousehold();
        }
      },
      error: (error) => {
        this.submitting = false;
        const message = error.error?.message || 'Invalid invite code';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  copyInviteCode(): void {
    if (this.household?.inviteCode) {
      navigator.clipboard.writeText(this.household.inviteCode);
      this.snackBar.open(' Invite code copied to clipboard!', 'Close', { duration: 2000 });
    }
  }
}
