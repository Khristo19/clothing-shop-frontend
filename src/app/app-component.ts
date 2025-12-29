import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './core/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app-component.html',
  styleUrl: './app-component.scss'
})
export class AppComponent implements OnInit {
  title = 'Clothing Shop';
  private settingsService = inject(SettingsService);

  ngOnInit() {
    // Fetch settings from backend on app initialization
    this.settingsService.fetchSettings().subscribe({
      next: () => {
        console.log('Settings loaded successfully');
      },
      error: (err) => {
        console.error('Failed to load settings on app init:', err);
      }
    });
  }
}
