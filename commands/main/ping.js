import os from "os"

export default {
  cmd: ["ping", "speed", "status"],
  name: "ping",
  category: "main",
  description: "Check bot response time and server statistics",

  async execute(m, { Func: func }) {
    const start = performance.now()
    await m.react("🏓")
    const end = performance.now()
    const responseTime = (end - start).toFixed(2)

    const systemInfo = {
      uptime: func.runtime(process.uptime()),
      platform: os.platform(),
      cpuCount: os.cpus().length,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      usedMemory: os.totalmem() - os.freemem(),
    }

    const statusMessage = `🏓 *Bot Status Report*

⚡ *Response Time:* ${responseTime}ms
⏱️ *Uptime:* ${systemInfo.uptime}
🖥️ *Platform:* ${systemInfo.platform}
💾 *Memory Usage:* ${func.formatSize(systemInfo.usedMemory)} / ${func.formatSize(systemInfo.totalMemory)}
🔧 *CPU Cores:* ${systemInfo.cpuCount}
📦 *Node.js:* ${systemInfo.nodeVersion}

*Memory Details:*
• RSS: ${func.formatSize(systemInfo.memoryUsage.rss)}
• Heap Used: ${func.formatSize(systemInfo.memoryUsage.heapUsed)}
• Heap Total: ${func.formatSize(systemInfo.memoryUsage.heapTotal)}
• External: ${func.formatSize(systemInfo.memoryUsage.external)}`

    await m.reply(statusMessage)
  },
}
