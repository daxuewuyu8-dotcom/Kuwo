export default {
  async fetch(request) {
    // ==== 规则源 ====
    const sources = [
      "https://raw.githubusercontent.com/Lynricsy/HyperADRules/master/rules.txt",
      "https://easylist.to/easylist/easylist.txt",
      "https://raw.githubusercontent.com/你的用户名/ChinaADRules/master/cn.txt",
      "https://raw.githubusercontent.com/你的用户名/VideoADRules/master/video.txt"
    ];

    const finalSet = new Set();

    for (let url of sources) {
      try {
        const res = await fetch(url);
        const text = await res.text();
        const lines = text.split("\n");

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith("#") || line.startsWith("!")) continue;

          // EasyList / 视频规则转换
          if (line.startsWith("||")) {
            const domain = line.replace("||", "").replace("^", "");
            finalSet.add(`DOMAIN-SUFFIX,${domain},REJECT`);
          }
          // 原始规则处理
          else if (line.includes(",")) {
            if (!line.match(/,(REJECT|DIRECT|PROXY)$/)) {
              line += ",REJECT";
            }
            finalSet.add(line);
          }
        }
      } catch (e) {
        continue;
      }
    }

    // ==== 白名单（防误杀）====
    const whitelist = [
      "apple.com",
      "icloud.com",
      "mzstatic.com",
      "google.com",
      "youtube.com",
      "chat.openai.com",
      "openai.com",
      "claude.ai",
      "gpt.ai"
    ];
    for (let d of whitelist) finalSet.add(`DOMAIN-SUFFIX,${d},DIRECT`);

    // ==== AI 分流（自动走海外代理）====
    const aiDomains = [
      "chat.openai.com",
      "api.openai.com",
      "claude.ai",
      "gpt.ai"
    ];
    for (let d of aiDomains) finalSet.add(`DOMAIN-SUFFIX,${d},PROXY`);

    // ==== 输出 Shadowrocket 配置 ====
    let output = `[Rule]\n\n`;
    output += Array.from(finalSet).join("\n");
    output += `\n\n// 国内直连\nGEOIP,CN,DIRECT\n`;
    output += `// 兜底走代理\nFINAL,PROXY\n`;

    return new Response(output, {
      headers: { "content-type": "text/plain;charset=UTF-8" }
    });
  }
};