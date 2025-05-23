import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  homepage: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  demoUrl?: string; // Extracted from description or homepage
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'https://api.github.com';
  private username = 'ayoubachak';
  
  constructor(private http: HttpClient) { }

  /**
   * Set GitHub username
   */
  setUsername(username: string): void {
    this.username = username;
  }

  /**
   * Get user's repositories
   * @param limit Maximum number of repos to return
   */
  getRepositories(limit: number = 10): Observable<GitHubRepo[]> {
    // GitHub API has a per_page limit of 100, so use that as maximum
    const perPage = Math.min(limit, 100);
    
    return this.http.get<GitHubRepo[]>(
      `${this.apiUrl}/users/${this.username}/repos?sort=updated&per_page=${perPage}`
    ).pipe(
      map(repos => repos.map(repo => {
        // Prioritize the homepage field if it exists
        if (repo.homepage && repo.homepage.trim() !== '') {
          repo.demoUrl = repo.homepage;
        } else {
          // Fall back to URL extraction from description if homepage is not available
          const demoUrlMatch = repo.description?.match(/demo[:\s]*(https?:\/\/\S+)/i);
          const liveUrlMatch = repo.description?.match(/live[:\s]*(https?:\/\/\S+)/i);
          const siteUrlMatch = repo.description?.match(/site[:\s]*(https?:\/\/\S+)/i);
          const urlMatch = repo.description?.match(/\b(https?:\/\/\S+)/i);
          
          // Prioritize the matches in order: demo > live > site > any URL
          repo.demoUrl = demoUrlMatch ? demoUrlMatch[1] : 
                        liveUrlMatch ? liveUrlMatch[1] :
                        siteUrlMatch ? siteUrlMatch[1] :
                        urlMatch ? urlMatch[1] : 
                        '';
        }
        return repo;
      })),
      catchError(err => {
        console.error('Error fetching GitHub repositories', err);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Get details for a specific repository
   * @param repoName Repository name
   */
  getRepositoryDetails(repoName: string): Observable<GitHubRepo> {
    return this.http.get<GitHubRepo>(`${this.apiUrl}/repos/${this.username}/${repoName}`)
      .pipe(
        catchError(err => {
          console.error(`Error fetching repository '${repoName}'`, err);
          return throwError(() => new Error(`Repository '${repoName}' not found`));
        })
      );
  }

  /**
   * Get latest commits for a repository
   * @param repoName Repository name
   * @param limit Number of commits to fetch
   */
  getRepositoryCommits(repoName: string, limit: number = 5): Observable<GitHubCommit[]> {
    return this.http.get<GitHubCommit[]>(`${this.apiUrl}/repos/${this.username}/${repoName}/commits?per_page=${limit}`)
      .pipe(
        catchError(err => {
          console.error(`Error fetching commits for '${repoName}'`, err);
          return of([]); // Return empty array on error
        })
      );
  }

  /**
   * Get repositories with their latest commits
   * @param limit Maximum number of repos to return
   */
  getRepositoriesWithCommits(limit: number = 6): Observable<(GitHubRepo & { latestCommits: GitHubCommit[] })[]> {
    return this.getRepositories(limit).pipe(
      switchMap(repos => {
        if (repos.length === 0) {
          return of([]);
        }
        
        const reposWithCommits$ = repos.map(repo => 
          this.getRepositoryCommits(repo.name, 3).pipe(
            map(commits => ({ ...repo, latestCommits: commits }))
          )
        );
        
        return forkJoin(reposWithCommits$);
      })
    );
  }
}
