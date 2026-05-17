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

后台通过同域接口控制玩家是否看到小地图：

- `POST /api/game-settings/auth`
- `GET /api/game-settings`
- `POST /api/game-settings`

`POST` 请求体：

```json
{
  "password": "seeinglab",
  "showMinimap": true
}
```

返回格式：

```json
{
  "showMinimap": true,
  "updatedAt": "2026-05-17T00:00:00.000Z",
  "version": 1
}
```

Service Worker 会跳过 `/api/`，不会缓存后台设置。

## 音频架构

所有声音统一走 `GAME_CONFIG.audioCues`。`音效3.0.zip` 和 `主人公旁白配音.zip` 中已有的 39 个 MP3 已整理到 `assets/audio/`，按需在线播放，不进入 Service Worker 预缓存。缺失素材继续使用合成音或静默兜底，后续补齐后只需要给 cue 填 `src`。

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

导航声已改成宽频 beacon，并随距离调整脉冲间隔。

已接入的真实音效包括雨声、心跳、眩晕、风、风铃、饮水机出水、床上起身、开门/关门、地毯脚步、书桌翻找、家具撞击、水滴等。主人公旁白配音已接入关键剧情节点，并作为非空间化人声层播放；方向目标声、家具声和碰撞声继续走 `PannerNode`。暂缺奶奶真实录音、结尾 BGM、鸡鸣、咳嗽、磁带底噪和磁带咔哒，当前使用字幕或合成音过渡。

## 碰撞反馈

- Android Chrome：碰撞时调用 `navigator.vibrate([0, 85])`，并播放对应家具材质撞击声。
- iPhone Safari：Web 震动通常不可用，因此用低频撞击声、屏幕短抖和“前面好像过不去。”提示兜底。
- 家具碰撞音按材质映射：衣橱、床/沙发、电视柜、餐桌、书柜分别使用不同 MP3。

## 辅助规则

- 导航时如果连续偏离目标方向约 3 秒，会提示“声音好像在另一个方向。”
- 原地停留约 5 秒，会重播更清晰的目标声。
- 麦克风回应失败两次后，允许轻触屏幕备用回应。

## 内容

- 卧室：床、衣橱、饮水机、书桌、书柜、门、水杯起点。
- 客厅：沙发、地毯、电视柜、餐桌、厕所门、卧室门、奶奶卧室门、大门。
- 回忆：走向奶奶声源，最后用麦克风音量阈值完成回应。

## 文件

- `index.html`：页面结构
- `styles.css`：竖屏布局、字幕 UI、开发者页
- `game.js`：剧情、地图、控制、碰撞、音频、麦克风、后台同步
- `manifest.json`：PWA 竖屏配置
- `service-worker.js`：离线缓存
