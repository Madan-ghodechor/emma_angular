import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound implements AfterViewInit {
  @ViewChild('particles', { static: true })
  private particles!: ElementRef<HTMLDivElement>;

  constructor(
    private readonly location: Location,
    private readonly renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    for (let i = 0; i < 35; i++) {
      const particle = this.renderer.createElement('div');
      const duration = 6 + Math.random() * 10;
      const delay = Math.random() * 14;

      this.renderer.addClass(particle, 'particle');
      this.renderer.setStyle(particle, '--dur', `${duration}s`);
      this.renderer.setStyle(particle, '--delay', `${delay}s`);
      this.renderer.setStyle(particle, '--x', `${Math.random() * 100}%`);

      if (Math.random() > 0.6) {
        this.renderer.setStyle(particle, 'background', '#ff6b9d');
      }

      if (Math.random() > 0.8) {
        this.renderer.setStyle(particle, 'background', '#00e5ff');
      }

      if (Math.random() > 0.5) {
        this.renderer.setStyle(particle, 'width', '2px');
        this.renderer.setStyle(particle, 'height', '2px');
      }

      this.renderer.appendChild(this.particles.nativeElement, particle);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
