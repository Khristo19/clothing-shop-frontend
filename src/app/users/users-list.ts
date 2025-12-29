import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../core/api';
import { User as ApiUser } from '../core/models';

type User = {
  id: number;
  email: string;
  role: 'admin' | 'cashier';
  active: boolean;
  created_at?: string;
};

type UserFormData = {
  email: string;
  password: string;
  role: 'admin' | 'cashier';
};

type EditUserFormData = {
  email: string;
  role: 'admin' | 'cashier';
  active: boolean;
};

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="users-container">
      <div class="header">
        <h2 class="page-title">User Management</h2>
        <button class="btn-primary" (click)="openCreateModal()">
          <span class="btn-icon">+</span>
          Add User
        </button>
      </div>

      @if (loading() && !users().length) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading users...</p>
        </div>
      }

      @if (error()) {
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          {{ error() }}
        </div>
      }

      @if (!loading() || users().length) {
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ totalUsers() }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ adminCount() }}</div>
            <div class="stat-label">Admins</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ cashierCount() }}</div>
            <div class="stat-label">Cashiers</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeCount() }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="table-container">
            @if (users().length > 0) {
              <table class="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr [class.inactive]="!user.active">
                      <td class="user-id">{{ user.id }}</td>
                      <td class="user-email">{{ user.email }}</td>
                      <td>
                        <span class="role-badge" [class.role-admin]="user.role === 'admin'" [class.role-cashier]="user.role === 'cashier'">
                          {{ user.role | uppercase }}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge" [class.status-active]="user.active" [class.status-inactive]="!user.active">
                          {{ user.active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="user-date">{{ formatDate(user.created_at) }}</td>
                      <td class="actions">
                        <button class="btn-action btn-edit" (click)="openEditModal(user)" title="Edit user">
                          ✏️
                        </button>
                        <button class="btn-action btn-delete" (click)="confirmDelete(user)" title="Delete user">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p class="empty-title">No users found</p>
                <p class="empty-description">Create your first user to get started</p>
                <button class="btn-primary" (click)="openCreateModal()">Add User</button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Create User Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create New User</h3>
              <button class="btn-close" (click)="closeCreateModal()">×</button>
            </div>

            <form [formGroup]="createForm" (ngSubmit)="createUser()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="create-email">Email Address</label>
                  <input
                    id="create-email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    placeholder="user@example.com"
                    [class.error]="createForm.get('email')?.invalid && createForm.get('email')?.touched"
                  />
                  @if (createForm.get('email')?.invalid && createForm.get('email')?.touched) {
                    <span class="field-error">Valid email is required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="create-password">Password</label>
                  <input
                    id="create-password"
                    type="password"
                    formControlName="password"
                    class="form-input"
                    placeholder="••••••••"
                    [class.error]="createForm.get('password')?.invalid && createForm.get('password')?.touched"
                  />
                  @if (createForm.get('password')?.invalid && createForm.get('password')?.touched) {
                    <span class="field-error">Password must be at least 6 characters</span>
                  }
                </div>

                <div class="form-group">
                  <label for="create-role">Role</label>
                  <select
                    id="create-role"
                    formControlName="role"
                    class="form-input"
                    [class.error]="createForm.get('role')?.invalid && createForm.get('role')?.touched"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                  </select>
                  @if (createForm.get('role')?.invalid && createForm.get('role')?.touched) {
                    <span class="field-error">Role is required</span>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeCreateModal()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="createForm.invalid || submitting()">
                  @if (submitting()) {
                    <span class="spinner-small"></span>
                  }
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Edit User Modal -->
      @if (showEditModal() && selectedUser()) {
        <div class="modal-overlay" (click)="closeEditModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Edit User</h3>
              <button class="btn-close" (click)="closeEditModal()">×</button>
            </div>

            <form [formGroup]="editForm" (ngSubmit)="updateUser()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    placeholder="user@example.com"
                    [class.error]="editForm.get('email')?.invalid && editForm.get('email')?.touched"
                  />
                  @if (editForm.get('email')?.invalid && editForm.get('email')?.touched) {
                    <span class="field-error">Valid email is required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="edit-role">Role</label>
                  <select
                    id="edit-role"
                    formControlName="role"
                    class="form-input"
                    [class.error]="editForm.get('role')?.invalid && editForm.get('role')?.touched"
                  >
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      formControlName="active"
                      class="form-checkbox"
                    />
                    <span>Active User</span>
                  </label>
                  <p class="form-hint">Inactive users cannot log in to the system</p>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="editForm.invalid || submitting()">
                  @if (submitting()) {
                    <span class="spinner-small"></span>
                  }
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal() && userToDelete()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="modal-content modal-small" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Confirm Deletion</h3>
              <button class="btn-close" (click)="closeDeleteModal()">×</button>
            </div>

            <div class="modal-body">
              <p class="confirm-message">
                Are you sure you want to delete user <strong>{{ userToDelete()?.email }}</strong>?
              </p>
              <p class="confirm-warning">This action cannot be undone.</p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeDeleteModal()">Cancel</button>
              <button type="button" class="btn-danger" (click)="deleteUser()" [disabled]="submitting()">
                @if (submitting()) {
                  <span class="spinner-small"></span>
                }
                Delete User
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    /* Buttons */
    .btn-primary, .btn-secondary, .btn-danger {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #b91c1c;
    }

    .btn-danger:disabled {
      background: #fca5a5;
      cursor: not-allowed;
    }

    .btn-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    .btn-action {
      padding: 0.375rem 0.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.2s;
      font-size: 1rem;
    }

    .btn-edit:hover {
      background: #dbeafe;
    }

    .btn-delete:hover {
      background: #fee2e2;
    }

    .btn-close {
      padding: 0;
      border: none;
      background: transparent;
      font-size: 2rem;
      line-height: 1;
      cursor: pointer;
      color: #6b7280;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-close:hover {
      background: #f3f4f6;
      color: #111827;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    /* Loading and Error States */
    .loading-state {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #e5e7eb;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    .spinner-small {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }

    .error-icon {
      font-size: 1.25rem;
    }

    /* Card */
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    /* Table */
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table thead {
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .users-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
    }

    .users-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .users-table tbody tr:hover {
      background: #f9fafb;
    }

    .users-table tbody tr.inactive {
      opacity: 0.6;
    }

    .user-id {
      font-weight: 600;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .user-email {
      font-weight: 500;
      color: #111827;
    }

    .user-date {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
    }

    .role-admin {
      background: #dbeafe;
      color: #1e40af;
    }

    .role-cashier {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .actions {
      display: flex;
      gap: 0.25rem;
    }

    /* Empty State */
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .empty-description {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
    }

    .modal-small {
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    /* Form */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-input.error {
      border-color: #dc2626;
    }

    .form-input.error:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .field-error {
      display: block;
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.375rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
    }

    .form-checkbox {
      width: 1.125rem;
      height: 1.125rem;
      cursor: pointer;
    }

    .form-hint {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
      margin-bottom: 0;
    }

    /* Confirmation */
    .confirm-message {
      color: #374151;
      margin-bottom: 0.75rem;
    }

    .confirm-warning {
      color: #dc2626;
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0;
    }
  `]
})
export class UsersListComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  // State
  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  // Modal states
  readonly showCreateModal = signal(false);
  readonly showEditModal = signal(false);
  readonly showDeleteModal = signal(false);
  readonly selectedUser = signal<User | null>(null);
  readonly userToDelete = signal<User | null>(null);

  // Forms
  readonly createForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required] as any
  });

  readonly editForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['admin' as 'admin' | 'cashier', Validators.required],
    active: [true]
  });

  // Computed values
  readonly totalUsers = computed(() => this.users().length);
  readonly adminCount = computed(() => this.users().filter(u => u.role === 'admin').length);
  readonly cashierCount = computed(() => this.users().filter(u => u.role === 'cashier').length);
  readonly activeCount = computed(() => this.users().filter(u => u.active).length);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.api.listUsers().subscribe({
      next: (data: ApiUser[]) => {
        const normalized: User[] = (data || []).map((user: ApiUser) => ({
          id: Number(user.id || 0),
          email: user.email || '',
          role: user.role || 'cashier',
          active: true,
          created_at: user.created_at || undefined
        }));
        this.users.set(normalized);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to load users');
        this.loading.set(false);
      }
    });
  }

  // Modal controls
  openCreateModal() {
    this.createForm.reset({ email: '', password: '', role: '' as any });
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.createForm.reset();
  }

  openEditModal(user: User) {
    this.selectedUser.set(user);
    this.editForm.patchValue({
      email: user.email,
      role: user.role,
      active: user.active
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
    this.editForm.reset();
  }

  confirmDelete(user: User) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  // CRUD operations
  createUser() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const payload = this.createForm.getRawValue() as UserFormData;

    this.api.createUser(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to create user');
        this.submitting.set(false);
      }
    });
  }

  updateUser() {
    if (this.editForm.invalid || !this.selectedUser()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const userId = this.selectedUser()!.id;
    const payload = this.editForm.getRawValue() as EditUserFormData;

    this.api.updateUser(userId, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to update user');
        this.submitting.set(false);
      }
    });
  }

  deleteUser() {
    if (!this.userToDelete()) return;

    this.submitting.set(true);
    this.error.set(null);

    const userId = this.userToDelete()!.id;

    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Failed to delete user');
        this.submitting.set(false);
      }
    });
  }

  // Utility methods
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return 'N/A';
    }
  }
}
