import slugify from 'slugify'

export const generateSlug = (title: string): string => {
  return slugify(title, { lower: true, strict: true, trim: true })
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