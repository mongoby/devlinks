export const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return formatDate(date)
}

export const formatRelativeTime = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diff = now - target
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  if (weeks < 4) return `${weeks} 周前`
  if (months < 12) return `${months} 个月前`
  return formatDate(date)
}

export const isToday = (date) => {
  const today = new Date()
  const target = new Date(date)
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  )
}

export const isThisWeek = (date) => {
  const now = new Date()
  const target = new Date(date)
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  return now - target <= oneWeek && now >= target
}

export const isThisMonth = (date) => {
  const now = new Date()
  const target = new Date(date)
  return (
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth()
  )
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
