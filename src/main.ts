import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app-component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Application failed to bootstrap:', err);
    // Application failed to bootstrap - show user-friendly error
    if (typeof window !== 'undefined' && document.body) {
      document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif;"><h1>Application Failed to Load</h1><p>Check the console for details. If the problem persists, contact support.</p><pre style="text-align:left;background:#f3f4f6;padding:1rem;border-radius:8px;margin-top:1rem">' + err + '</pre></div>';
    }
  });
