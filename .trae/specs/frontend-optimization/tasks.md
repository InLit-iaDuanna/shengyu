# Tasks
- [x] Task 1: Throttle DOM updates for Debug UI
  - [x] SubTask 1.1: Create a throttled version of `updateDebug` in `game.js` (e.g., `updateDebugThrottled` running at ~250ms intervals).
  - [x] SubTask 1.2: Replace calls to `updateDebug()` inside the high-frequency `updateGame` loop with the throttled version.
- [x] Task 2: Improve Background Resource Management
  - [x] SubTask 2.1: Introduce a `rafRunning` flag in `game.js` to control the `gameLoop` execution.
  - [x] SubTask 2.2: Update `handleVisibilityChange` in `game.js` to toggle `rafRunning`, and call `stopAllLoops()` and `stopMic()` when the document is hidden.
- [x] Task 3: Optimize WebAudio Memory Management
  - [x] SubTask 3.1: Add `onended` event handlers to the source nodes in `game.js` where audio is played.
  - [x] SubTask 3.2: Within the `onended` handlers, explicitly call `disconnect()` on the source and associated gain nodes.
- [x] Task 4: Fix Service Worker Caching and Offline Fallback
  - [x] SubTask 4.1: Remove `"./developer/"` from the `ASSETS` array in `service-worker.js`.
  - [x] SubTask 4.2: Add a check for `event.request.mode === "navigate"` in the `fetch` event listener to reliably return the cached `./index.html`.
- [ ] Task 5: 优化启动初始化链路
  - [ ] SubTask 5.1: 将开始按钮后的初始化拆分为更清晰的阶段状态，优先保证音频与姿态就绪，不让非首屏必需能力阻塞校准和教学入口。
  - [ ] SubTask 5.2: 将麦克风相关准备保持在 `micPrompt` 触发前后按需发生，并为 iOS/权限失败场景保留明确重试与降级提示，不改变剧情与玩法。
- [ ] Task 6: 收敛小地图与调试画布重绘
  - [ ] SubTask 6.1: 为 `render`/小地图绘制引入“仅在状态变化时重绘”的判断，至少覆盖玩家位置、朝向、场景、目标、画布尺寸和调试开关。
  - [ ] SubTask 6.2: 当玩家端隐藏小地图、页面不可见，或当前不在需要显示地图的界面时，停止无意义的画布重绘。
- [ ] Task 7: 优化开发者设置同步轮询
  - [ ] SubTask 7.1: 调整 `startSettingsPolling`，让页面可见性、玩家/开发者路由和当前请求状态共同决定是否继续拉取远程设置。
  - [ ] SubTask 7.2: 避免设置请求重叠发起，并在远程服务不可用时优先复用本地缓存，减少持续无效请求。

# Task Dependencies
- Task 6 depends on Task 5 only in verification order, not in code coupling.
- Task 7 can be implemented in parallel with Task 5 and Task 6.
