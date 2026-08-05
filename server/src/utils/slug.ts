import slugify from 'slugify'

export const generateSlug = (title: string): string => {
  const slug = slugify(title, { lower: true, strict: true, trim: true })
  // slugify strips non-Latin scripts (e.g. Bangla), which can produce an
  // empty string for titles written entirely in Bangla or other scripts.
  // Fall back to a safe, still-readable slug so uploads/links never break.
  if (slug) return slug
  return `campaign-${Date.now().toString(36)}`
}

export const generateUniqueSlug = (
  title: string,
  existingSlugs: string[]
): string => {
  const base = generateSlug(title)

  if (!existingSlugs.includes(base)) return base

  let counter = 2
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++
  }

  return `${base}-${counter}`
}