import { Routes } from '@angular/router';
import { CoverageComponent } from './components/coverage/coverage.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { ServicesComponent } from './components/servicio/services.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    {  path: '', component: HomeComponent },
    { path: 'Cobertura', component: CoverageComponent },
    { path: 'Clientes', component: ReviewsComponent },
    { path: 'Servicios', component: ServicesComponent },
];
