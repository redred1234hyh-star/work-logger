export const BRANDS = [
  {
    id: 'InLife',
    label: 'InLife',
    shortcode: 'IL',
    keywords: ['IL', 'InLife'],
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    id: 'Minus Plus',
    label: 'Minus Plus',
    shortcode: 'MP',
    keywords: ['M+', 'MP'],
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  {
    id: 'Miris Spa',
    label: 'Miris Spa',
    shortcode: 'MS',
    keywords: ['MS'],
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
  },
  {
    id: 'Miris Mama',
    label: 'Miris Mama',
    shortcode: 'MM',
    keywords: ['MM'],
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
  {
    id: 'Consguard',
    label: 'Consguard',
    shortcode: 'CG',
    keywords: ['Consguard', 'CG'],
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  {
    id: 'Multi Plus',
    label: 'Multi Plus',
    shortcode: 'MT',
    keywords: ['MT', 'Multi+', 'MTP'],
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    border: 'border-gray-300',
    countText: 'text-gray-700',
  },
  {
    id: 'General',
    label: '其他',
    shortcode: 'Other',
    keywords: [],
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
]

export const BRAND_IDS = BRANDS.map((b) => b.id)
export const BRAND_NAMES = BRANDS.filter((b) => b.id !== 'General').map((b) => b.label)

export function getBrand(id) {
  return BRANDS.find((b) => b.id === id) ?? BRANDS.find((b) => b.id === 'General')
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function extractBrandFromText(text) {
  if (!text) return []
  return BRANDS
    .filter((b) => b.keywords?.length && b.keywords.some(
      (kw) => new RegExp(`(?<![a-zA-Z0-9])${escapeRegex(kw)}(?![a-zA-Z0-9])`, 'i').test(text)
    ))
    .map((b) => b.id)
}

export const STATUS_OPTIONS = ['待開始', '進行中', '待審批', '已完成']
