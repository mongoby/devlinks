export const validator = {
  isUrl: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  isRequired: (value) => {
    return value !== undefined && value !== null && value.toString().trim() !== ''
  },
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  minLength: (value, min) => {
    return value.length >= min
  },
  maxLength: (value, max) => {
    return value.length <= max
  },
  isValidJSON: (str) => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  },
  isValidTags: (tags, maxCount = 20) => {
    if (!Array.isArray(tags)) return false
    if (tags.length > maxCount) return false
    return tags.every(
      (tag) => typeof tag === 'string' && tag.trim().length > 0 && tag.trim().length <= 50
    )
  }
}
