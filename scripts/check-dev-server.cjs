/**
 * @description 检查 dev server 是否在运行，防止 Prisma 生成时 DLL 被锁定
 * @description 独立 .cjs 脚本，无需编译即可运行
 * @author gouxinjie
 * @created 2026-07-02
 */
const net = require("net");

const PORT = 3400;
const socket = new net.Socket();

socket.on("connect", () => {
  console.error("\n========================================");
  console.error("  ⚠️  端口 3400 已被占用（dev server 可能在运行）");
  console.error("  请先 Ctrl+C 停止 dev server，再执行 Prisma 命令");
  console.error("  否则 query_engine-windows.dll.node 可能被锁定并损坏");
  console.error("========================================\n");
  socket.destroy();
  process.exit(1);
});

socket.on("error", () => {
  // 连接失败 = 端口空闲 = 安全
  process.exit(0);
});

socket.setTimeout(2000, () => {
  socket.destroy();
  process.exit(0);
});

socket.connect(PORT, "127.0.0.1");
