import parseFrontmatter from 'gray-matter'

export function parseNote(contents: string) {
  let { data: frontmatter, content } = parseFrontmatter(contents)
  content = content.trim()
  const links: string[] = []
  content = content.replace(/\((\d+T\d+Z\d+)\)/g, (_, pageId) => {
    links.push(pageId)
    return ''
  })
  let title = frontmatter.title || ''
  if (!title) {
    const match = content.match(/^(.*?)(?:\.\s|\n|$)/)
    if (match) {
      title = match[1]
      content = content.slice(title.length).trim()
    }
  }
  if (frontmatter.topic) {
    title += ' (topic)'
  }
  return {
    excerpt: content.slice(0, 256),
    title,
  }
}
