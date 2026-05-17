# 回声里的家

竖屏空间音频剧情解谜 PWA demo。玩家从卧室醒来，跟随空间声源完成接水、拾取磁带、寻找播放器、播放录音，并在结尾用麦克风音量回应一声。

## 运行

```bash
python3 -m http.server 8001
```

打开：

```text
http://localhost:8001
```

手机测试建议使用 HTTPS，并竖屏打开。

## 控制

- 手机：竖屏自然握持，点击开始后校准姿态，再完成新手教学。
- 移动：倾斜超过阈值后按固定速度移动。
- 转头：按住屏幕左半边或右半边。
- 反转：教学页可切换“前后反了”“左右反了”，设置会保存在本机。
- 桌面调试：`WASD` 移动，`Q/E` 转头。
- 调试 HUD：长按左上角约 1 秒切换显示。

## 开发者后台

访问：

```text
https://game.chugao.art/developer
```

密码：

```text
seeinglab
```

后台通过同域接口控制玩家端空间音频模式：

- `POST /api/game-settings/auth`
- `GET /api/game-settings`
- `POST /api/game-settings`

`POST` 请求体：

```json
{
  "password": "seeinglab",
  "spatialMode": "boosted"
}
```

返回格式：

```json
{
  "spatialMode": "boosted",
  "updatedAt": "2026-05-17T00:00:00.000Z",
  "version": 1
}
```

Service Worker 会跳过 `/api/`，不会缓存后台设置。

## 音频架构

所有声音统一走 `GAME_CONFIG.audioCues`。当前已有 43 个 MP3 已整理到 `assets/audio/`，按需在线播放，不进入 Service Worker 预缓存。缺失素材继续使用合成音或静默兜底，后续补齐后只需要给 cue 填 `src`。当前不再以 8MB 作为素材限制，只记录实际体积。

```js
waterBoil: {
  kind: "file",
  src: "./assets/audio/water-dispenser.mp3",
  spatial: true,
  loop: true,
  volume: 0.7,
  fallback: "waterBoil"
}
```

播放链路：

```text
AudioBufferSource / Synthetic Source -> Gain -> PannerNode -> MasterGain -> Destination
```

导航时不再播放额外“滴滴滴”提示音，方向主要依靠目标真实声源、偏离提示和停留后的目标声重播。

已接入的真实音效包括雨声、心跳、眩晕、风、风铃、饮水机出水、杯子落桌、床上起身、开门/关门、地毯脚步、书桌翻找、家具撞击、水滴、鸡鸣等。主人公旁白和奶奶配音已接入关键剧情节点；磁带里的奶奶录音作为清晰人声播放，回忆导航使用无词空间引导声，到达后只播放一次奶奶呼唤。磁带掉落使用短促合成音，避免把水滴声误听成杯子落桌。暂缺结尾 BGM、咳嗽、磁带底噪和磁带咔哒，当前使用字幕或合成音过渡。

## 碰撞反馈

- Android Chrome：碰撞时优先调用 `navigator.vibrate([0, 85])`，并播放对应家具材质撞击声。
- iPhone Safari：Web 震动通常不可用，因此用低频撞击声、屏幕短抖和“前面好像过不去。”提示兜底。
- iOS 原生壳：碰撞时会尝试 `Capacitor.Plugins.Haptics.impact({ style: "medium" })`，也支持 `window.webkit.messageHandlers.haptic.postMessage({ type: "impact", style: "medium" })` 桥接。
- 家具碰撞音按材质映射：衣橱、床/沙发、电视柜、餐桌、书柜分别使用不同 MP3。

## 辅助规则

- 导航时如果连续偏离目标方向约 3 秒，会提示“声音好像在另一个方向。”
- 原地停留约 5 秒，会重播更清晰的目标声。
- 雨声作为室外背景层低音量淡入；饮水机作为目标声更响，确保雨声不盖过听声辨位。
- 麦克风回应使用更低 RMS 阈值和 peak 检测，短促说“唉/诶”也能通过；失败两次后允许轻触屏幕备用回应。
- 剧情段开始后会锁住轻触跳过：有语音/关键音效时等声音结束，长环境声最多锁 5 秒，避免玩家只扫文字直接跳过声音。

## 内容

- 卧室：床、衣橱、饮水机、书桌、书柜、门、水杯起点。
- 客厅：沙发、地毯、电视柜、餐桌、厕所门、卧室门、奶奶卧室门、大门。
- 回忆：鸡鸣天亮后听见奶奶呼唤，最后用麦克风音量阈值完成回应。

## 文件

- `index.html`：页面结构
- `styles.css`：竖屏布局、字幕 UI、开发者页
- `game.js`：剧情、场景、控制、碰撞、音频、麦克风、后台同步
- `manifest.json`：PWA 竖屏配置
- `service-worker.js`：离线缓存
