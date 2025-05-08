import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  loading = false;
  submitted = false;
  loginForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  } 
  onSubmit() {
    this.submitted = true;
    
    if (this.loginForm.valid) {
      console.log('Form submitted:', this.loginForm.value);
      
      this.loading = true;
      this.error = '';
      
      this.authService.login({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      }).subscribe({
        next: (response) => {
          console.log('Authentication successful', response);
          this.router.navigate(['/dashboard']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Authentication failed', error);
          
          if (error.status === 0) {
            this.error = 'Cannot connect to server. Is the backend running?';
          } else if (error.status === 400) {
            this.error = error.error?.message || "Nom d'utilisateur ou mot de passe non valide";
          } else {
            this.error = 'Authentication failed. Please try again.';
          }
          this.loading = false;
        }
      });
    }
  }
    
}
