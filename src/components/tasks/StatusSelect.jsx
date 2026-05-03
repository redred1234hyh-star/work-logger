import { STATUS_OPTIONS } from '../../config/brands'

const STYLE = {
  '待開始': 'bg-gray-100 text-gray-600',
  '進行中': 'bg-yellow-50 text-yellow-700',
  '待審批': 'bg-blue-50 text-blue-700',
  '已完成': 'bg-green-50 text-green-700',
}

export default function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs rounded px-2 py-1 border-0 font-medium cursor-pointer focus:ring-1 focus:ring-pink-200 ${STYLE[value] ?? 'bg-gray-100'}`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
