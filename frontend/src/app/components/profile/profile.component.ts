import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  
  editForm = {
    name: '',
    bio: '',
    favoriteColor: '#667eea',
    theme: 'light'
  };

  // Predefined avatar options
  avatarOptions = [
    '👤', '👨', '👩', '🧑', '👴', '👵',
    '👶', '🧒', '👦', '👧', '🧔', '👨‍🦰',
    '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩‍🦰', '👩‍🦱', '👩‍🦳',
    '👩‍🦲', '🧑‍🦰', '🧑‍🦱', '🧑‍🦳', '🧑‍🦲',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
    '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
    '🦄', '🐝', '🦋', '🐌', '🐙', '🦀'
  ];

  selectedAvatar = '👤';
  showAvatarPicker = false;

  colorOptions = [
    { name: 'Purple', value: '#667eea' },
    { name: 'Blue', value: '#2196f3' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Red', value: '#f44336' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Teal', value: '#009688' },
    { name: 'Indigo', value: '#3f51b5' }
  ];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.editForm = {
          name: user.name,
          bio: user.bio || '',
          favoriteColor: user.favoriteColor || '#667eea',
          theme: user.theme || 'light'
        };
        this.selectedAvatar = user.avatar || '👤';
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  toggleAvatarPicker(): void {
    this.showAvatarPicker = !this.showAvatarPicker;
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
    this.showAvatarPicker = false;
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    const updateData = {
      ...this.editForm,
      avatar: this.selectedAvatar
    };

    this.profileService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.currentUser = response.user;
        this.isEditing = false;
        
        // Update auth service with new user data
        this.authService.getMe().subscribe();
        
        alert('Profile updated successfully! 🎉');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadProfile();
  }

  getAvatarDisplay(): string {
    if (!this.selectedAvatar) return '👤';
    
    // If it's an emoji (single character or emoji)
    if (this.selectedAvatar.length <= 4) {
      return this.selectedAvatar;
    }
    
    // If it's a base64 image, return empty (will use background-image)
    return '';
  }

  isImageAvatar(): boolean {
    return !!this.selectedAvatar && this.selectedAvatar.startsWith('data:image/');
  }
}