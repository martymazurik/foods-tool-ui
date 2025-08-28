// File: src/app/uri-list/uri-list.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-uri-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    MatTooltipModule,
    MatIconModule
  ],
  templateUrl: './uri-list.component.html',
  styleUrls: ['./uri-list.component.scss']
})
export class UriListComponent {
  @Input() nutritionSiteCandidates: string[] = [];
  @Input() productImageSiteCandidates: string[] = [];

  truncateUrl(url: string): string {
    const maxLength = 45;
    
    if (url.length <= maxLength) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname + urlObj.search;
      
      if (domain.length > maxLength - 10) {
        return domain.substring(0, maxLength - 3) + '...';
      }
      
      const availableLength = maxLength - domain.length - 5;
      if (path.length > availableLength) {
        const truncatedPath = path.substring(0, availableLength) + '...';
        return domain + '/' + truncatedPath;
      }
      
      return url;
    } catch {
      return url.length > maxLength 
        ? url.substring(0, maxLength - 3) + '...'
        : url;
    }
  }

  hasLinks(): boolean {
    return (this.nutritionSiteCandidates?.length > 0) || 
           (this.productImageSiteCandidates?.length > 0);
  }
}