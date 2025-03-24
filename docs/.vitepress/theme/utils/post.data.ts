// .vitepress/theme/utils/post.data.ts
import { createContentLoader } from "vitepress"

interface Post {
  title: string
  url: string
  tags: string[]  // 必选
  cover?: string  // 可选
  created: DateInfo
  updated: DateInfo
}

interface DateInfo {
  time: number
  string: string
}

declare const data: Post[]
export { data }

export default createContentLoader("../src/posts/**/*.md", {
  transform(raw): Post[] {
    return raw
      .reduce<Post[]>((acc, { url, frontmatter }) => {
        // 排除 index.md 文件并检查必需的 frontmatter 字段
        if (
          !url.endsWith('index.md') &&
          frontmatter?.title &&
          frontmatter?.created &&
          frontmatter?.updated &&
          frontmatter?.tags &&
          !frontmatter.draft
        ) {
          const created = parseFrontmatterDate(frontmatter.created)
          const updated = parseFrontmatterDate(frontmatter.updated)

          acc.push({
            title: frontmatter.title,
            url: url.replace(/\/index\.md$/, '/'),
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags],
            cover: frontmatter.cover ? String(frontmatter.cover) : undefined,
            created: formatDate(created),
            updated: formatDate(updated),
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.updated.time - a.updated.time)
  }
})

function parseFrontmatterDate(raw: string | Date): Date {
  if (typeof raw === 'string') {
    const isoDate = raw.includes('T') ? raw : `${raw}T12:00:00`
    return new Date(isoDate)
  }
  return raw
}

function formatDate(date: Date): DateInfo {
  return {
    time: date.getTime(),
    string: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    })
  }
}