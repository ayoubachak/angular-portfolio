import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, Firestore, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: Date;
  imageUrl?: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firebaseConfig = {
    // Your Firebase configuration
    // Replace with your Firebase project details or keep empty
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  private db: Firestore | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase if configuration is set
   */
  private initializeFirebase(): void {
    // Check if any Firebase settings are provided
    const hasConfig = Object.values(this.firebaseConfig).some(value => value !== "");
    
    if (hasConfig) {
      try {
        const app = initializeApp(this.firebaseConfig);
        this.db = getFirestore(app);
        this.isInitialized = true;
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    } else {
      console.warn('Firebase not configured. Blog functionality will be disabled.');
    }
  }

  /**
   * Set Firebase configuration explicitly
   */
  setFirebaseConfig(config: any): void {
    this.firebaseConfig = config;
    this.initializeFirebase();
  }

  /**
   * Check if Firebase is properly initialized
   */
  isFirebaseInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get blog posts
   */
  getBlogPosts(postLimit: number = 5): Observable<BlogPost[]> {
    if (!this.isInitialized || !this.db) {
      console.warn('Firebase not initialized. Returning mock data.');
      return of(this.getMockBlogPosts());
    }

    try {
      const blogCollection = collection(this.db, 'blog-posts');
      const blogQuery = query(blogCollection, orderBy('publishDate', 'desc'), limit(postLimit));
      
      return from(getDocs(blogQuery)).pipe(
        map(snapshot => {
          return snapshot.docs.map(doc => this.convertToBlogPost(doc));
        }),
        catchError(error => {
          console.error('Error fetching blog posts:', error);
          return of(this.getMockBlogPosts());
        })
      );
    } catch (error) {
      console.error('Error setting up blog posts query:', error);
      return of(this.getMockBlogPosts());
    }
  }

  /**
   * Convert Firestore document to BlogPost
   */
  private convertToBlogPost(doc: QueryDocumentSnapshot<DocumentData>): BlogPost {
    const data = doc.data();
    return {
      id: doc.id,
      title: data['title'] || '',
      content: data['content'] || '',
      excerpt: data['excerpt'] || '',
      author: data['author'] || 'Anonymous',
      publishDate: data['publishDate']?.toDate() || new Date(),
      imageUrl: data['imageUrl'] || '',
      tags: data['tags'] || []
    };
  }

  /**
   * Get mock blog posts when Firebase is not available
   */
  private getMockBlogPosts(): BlogPost[] {
    return [
      {
        id: 'mock-post-1',
        title: 'Getting Started with Angular and Firebase',
        content: 'This is a placeholder for a blog post about Angular and Firebase integration...',
        excerpt: 'Learn how to integrate Firebase with your Angular applications for a powerful backend solution.',
        author: 'John Doe',
        publishDate: new Date('2023-05-15'),
        imageUrl: 'assets/images/placeholders/placeholder.jpg',
        tags: ['Angular', 'Firebase', 'Web Development']
      },
      {
        id: 'mock-post-2',
        title: 'Advanced CSS Animation Techniques',
        content: 'This is a placeholder for a blog post about CSS animations...',
        excerpt: 'Explore advanced CSS animation techniques to create engaging user experiences.',
        author: 'John Doe',
        publishDate: new Date('2023-04-20'),
        imageUrl: 'assets/images/placeholders/placeholder.jpg',
        tags: ['CSS', 'Animations', 'Frontend']
      }
    ];
  }
}
