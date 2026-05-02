import { getBrand } from '../config/brands'

export default function BrandTag({ brandId, size = 'sm' }) {
  const brand = getBrand(brandId)
  const cls = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
  return (
    <span className={`inline-block rounded-full font-medium ${cls} ${brand.bg} ${brand.text}`}>
      {brand.label}
    </span>
  )
}
