# 归林联机服务器

这个小服务器负责：

- 列出公开房间；
- 快速加入空闲房间；
- 创建带可选密码的房间；
- 同步同一房间内玩家的位置、职业、朝向和动作。

## 本地运行

```bash
npm install
npm start
```

默认地址为 `http://localhost:8787`，WebSocket 地址为
`ws://localhost:8787/ws`。

## Render

仓库根目录的 `render.yaml` 已经准备好 Render Blueprint。部署后健康检查地址为
`/health`。房间只代表正在进行的游戏；服务器重启或免费实例休眠后，空房间不会保留。
