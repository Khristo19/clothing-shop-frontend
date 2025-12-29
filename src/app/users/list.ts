import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, User, CreateUserPayload, UpdateUserPayload } from './users.service';
import { AuthService } from '../core/auth';
import { TranslationService } from '../core/translation.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list.html',
})
export class UsersListComponent {
  private usersService = inject(UsersService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  readonly translate = inject(TranslationService);
  readonly t = computed(() => this.translate.t());

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly modalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly editingUser = signal<User | null>(null);
  readonly userToDelete = signal<User | null>(null);
  readonly submitting = signal(false);
  readonly currentUser = computed(() => this.auth.user());

  readonly userForm = this.fb.nonNullable.group({
    name: [''],
    surname: [''],
    email: ['', [Validators.required]],
    password: [''],
    role: ['cashier' as 'admin' | 'cashier', [Validators.required]],
  });

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to load users');
      },
    });
  }

  openCreateModal() {
    this.editingUser.set(null);
    this.userForm.reset({
      name: '',
      surname: '',
      email: '',
      password: '',
      role: 'cashier',
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  openEditModal(user: User) {
    this.editingUser.set(user);
    this.userForm.patchValue({
      name: user.name || '',
      surname: user.surname || '',
      email: user.email,
      password: '',
      role: user.role,
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  submitForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    this.submitting.set(true);

    if (this.editingUser()) {
      // Update existing user
      const payload: UpdateUserPayload = {
        email: formValue.email,
        role: formValue.role,
        name: formValue.name || undefined,
        surname: formValue.surname || undefined,
      };

      this.usersService.updateUser(this.editingUser()!.id, payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message || 'Failed to update user');
        },
      });
    } else {
      // Create new user
      const payload: CreateUserPayload = {
        email: formValue.email,
        password: formValue.password,
        role: formValue.role,
        name: formValue.name || undefined,
        surname: formValue.surname || undefined,
      };

      this.usersService.createUser(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message || 'Failed to create user');
        },
      });
    }
  }

  openDeleteModal(user: User) {
    this.userToDelete.set(user);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.deleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete() {
    const user = this.userToDelete();
    if (!user) return;

    // Prevent deleting currently logged-in user
    if (user.email === this.currentUser()?.email) {
      this.error.set('Cannot delete currently logged-in user');
      this.closeDeleteModal();
      return;
    }

    this.submitting.set(true);
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Failed to delete user');
        this.closeDeleteModal();
      },
    });
  }

  readonly trackById = (_: number, user: User) => user.id;
}
