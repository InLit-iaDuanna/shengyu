# Frontend Optimization Spec

## Why
The frontend application has several areas where performance, memory management, and PWA best practices can be improved. Specifically, frequent DOM updates for debug info, running the game loop and microphone while the app is in the background, lingering WebAudio nodes, and suboptimal Service Worker caching strategies can negatively impact battery life, memory footprint, and offline reliability.

## What Changes
- **Performance**: Throttle the `updateDebug` function to reduce unnecessary DOM writes (e.g., limit to 4fps).
- **Battery/Performance**: Pause the main game loop (`requestAnimationFrame` logic), clear audio loops, and stop microphone processing when the document is hidden (`visibilitychange`).
- **Memory Management**: Explicitly disconnect WebAudio nodes (`oscillator`, `bufferSource`, `gain`) in their `onended` callbacks to facilitate garbage collection.
- **PWA/Service Worker**: Remove the invalid directory path (`"./developer/"`) from the `ASSETS` cache list and implement a robust navigation fallback strategy (`request.mode === 'navigate'`) to serve `index.html`.

## Impact
- Affected specs: Frontend Performance, Background Resource Usage, Offline Reliability.
- Affected code: `game.js`, `service-worker.js`.

## MODIFIED Requirements
### Requirement: Background Resource Management
When the application is put into the background (document becomes hidden), it SHALL suspend all resource-intensive operations including the game loop, microphone processing, and recurring audio loops, resuming them appropriately when brought back to the foreground.

### Requirement: Service Worker Caching
The Service Worker SHALL strictly cache specific file assets (not directories) and SHALL intercept all navigation requests to provide `index.html` as a fallback when offline.

### Requirement: DOM Performance
The debug UI panel SHALL NOT update on every frame, but rather throttle its updates to a reasonable frequency to save CPU cycles.
