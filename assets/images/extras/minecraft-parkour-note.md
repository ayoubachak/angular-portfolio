# Minecraft Parkour Video

This directory contains placeholder files for the Gen Z Easter egg.

For a real implementation, you could add a video file or use a YouTube embed like we're doing in the component:

```typescript
// Sanitize YouTube URLs to prevent XSS
videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
  'https://www.youtube.com/embed/n_Dv4JMiwK8?autoplay=1&mute=0'
);
```

The YouTube ID 'n_Dv4JMiwK8' is for a Minecraft parkour video, but you could replace this with any video you'd like.
