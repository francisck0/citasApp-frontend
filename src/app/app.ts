import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.css'
})
export class App {
  protected searchQuery = signal('');
  protected selectedSpecialty = signal('');
  protected selectedLocation = signal('');
  
  protected specialties = signal([
    'Medicina General', 'Cardiología', 'Dermatología', 'Ginecología',
    'Pediatría', 'Traumatología', 'Oftalmología', 'Psicología',
    'Dentista', 'Fisioterapia', 'Endocrinología', 'Neurología'
  ]);

  protected cities = signal([
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla',
    'Zaragoza', 'Málaga', 'Murcia', 'Palma',
    'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba'
  ]);

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onSpecialtySelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSpecialty.set(target.value);
  }

  onLocationSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedLocation.set(target.value);
  }

  onSearchSubmit() {
    console.log('Búsqueda:', {
      query: this.searchQuery(),
      specialty: this.selectedSpecialty(),
      location: this.selectedLocation()
    });
  }

  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
