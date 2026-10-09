import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ChatReply, ContactPayload, Post, PostSummary, Profile, Project } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  // Profile is shared by several pages, so fetch it once.
  readonly profile$: Observable<Profile> = this.http.get<Profile>(`${this.base}/profile`).pipe(shareReplay(1));

  projects(): Observable<Project[]> { return this.http.get<Project[]>(`${this.base}/projects`); }
  project(slug: string): Observable<Project> { return this.http.get<Project>(`${this.base}/projects/${slug}`); }
  posts(): Observable<PostSummary[]> { return this.http.get<PostSummary[]>(`${this.base}/posts`); }
  post(slug: string): Observable<Post> { return this.http.get<Post>(`${this.base}/posts/${slug}`); }
  sendContact(body: ContactPayload): Observable<{ ok: boolean }> { return this.http.post<{ ok: boolean }>(`${this.base}/contact`, body); }
  chat(message: string): Observable<ChatReply> { return this.http.post<ChatReply>(`${this.base}/chat`, { message }); }
}
