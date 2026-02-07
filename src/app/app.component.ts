import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { NavComponent } from './components/nav/nav.component';
import { HomeComponent } from './components/home/home.component';
import { ServicesComponent } from './components/servicio/services.component';
import { CoverageComponent } from './components/coverage/coverage.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavComponent,
    HomeComponent,
    ServicesComponent,
    CoverageComponent,
    ReviewsComponent,
    FooterComponent,
    RouterOutlet
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'SeelsWeb';

  constructor(@Inject(DOCUMENT) private doc: Document) {}

  ngOnInit(): void {
    const canonicalUrl = 'https://www.seels.online/';

    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;

    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }

    link.setAttribute('href', canonicalUrl);
  }
}
