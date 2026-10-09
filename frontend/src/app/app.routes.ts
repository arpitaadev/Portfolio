import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Arpita | AI Developer', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'projects', title: 'Projects | Arpita', loadComponent: () => import('./pages/projects/projects').then(m => m.Projects) },
  { path: 'projects/:slug', title: 'Project | Arpita', loadComponent: () => import('./pages/project-detail/project-detail').then(m => m.ProjectDetail) },
  { path: 'blog', title: 'Blog | Arpita', loadComponent: () => import('./pages/blog/blog').then(m => m.Blog) },
  { path: 'blog/:slug', title: 'Post | Arpita', loadComponent: () => import('./pages/post/post').then(m => m.PostPage) },
  { path: 'contact', title: 'Contact | Arpita', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: '**', title: 'Not found', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
];
