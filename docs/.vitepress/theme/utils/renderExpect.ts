/**
 * RSS 摘要生成函数
 * 只保留 ## 介绍 部分的内容，忽略其他标题块
 */
export function renderExpect(content: string): string {
  // 将内容按行分割
  const lines = content.split('\n');
  let inIntroduction = false;
  let introductionContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测是否进入介绍部分
    if (line === '## 介绍') {
      inIntroduction = true;
      continue;
    }
    
    // 如果已经在介绍部分中
    if (inIntroduction) {
      // 如果遇到其他二级标题，结束介绍部分
      if (line.startsWith('## ') && line !== '## 介绍') {
        break;
      }
      
      // 如果遇到三级标题，跳过标题行但保留内容
      if (line.startsWith('### ')) {
        continue;
      }
      
      // 如果遇到画廊或其他组件，结束介绍部分
      if (line.includes('<Gallery') || line.includes('## 画廊')) {
        break;
      }
      
      // 如果遇到其他组件或空行，跳过
      if (line.startsWith('<') || line === '') {
        continue;
      }
      
      // 添加有效内容
      if (line) {
        introductionContent.push(line);
      }
    }
  }
  
  // 清理内容：移除Markdown格式和多余空格
  const cleanedContent = introductionContent
    .map(line => {
      // 移除Markdown格式
      return line
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
        .replace(/\*(.*?)\*/g, '$1')     // 移除斜体
        .replace(/`(.*?)`/g, '$1')       // 移除代码格式
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接格式
        .trim();
    })
    .filter(line => line.length > 0) // 移除空行
    .join(' ')
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim();
  
  // 限制长度（RSS摘要通常建议150-250字符）
  if (cleanedContent.length > 200) {
    return cleanedContent.substring(0, 197) + '...';
  }
  
  return cleanedContent || '暂无介绍内容';
}