import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {AppComponent} from './app/app-component';
import {appConfig} from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // Application failed to bootstrap - show user-friendly error
    if (typeof window !== 'undefined' && document.body) {
      document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif;"><h1>Application Failed to Load</h1><p>Please refresh the page. If the problem persists, contact support.</p></div>';
    }
  });
