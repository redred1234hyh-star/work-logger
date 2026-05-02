export const BRANDS = [
  {
    id: 'InLife',
    label: 'InLife',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    id: 'Minus Plus',
    label: 'Minus Plus',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  {
    id: 'Miris Spa',
    label: 'Miris Spa',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
  },
  {
    id: 'Miris Mama',
    label: 'Miris Mama',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
  {
    id: 'Consguard',
    label: 'Consguard',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  {
    id: 'General',
    label: 'General',
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

export const STATUS_OPTIONS = ['待開始', '進行中', '待審批', '已完成']
