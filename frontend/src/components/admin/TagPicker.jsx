// Pilihan tag gaya belajar (VARK) & kepribadian untuk kelas. Dipakai di halaman Kelas dan Tag Jenis Konten.
export const varkOptions = ['visual', 'auditory', 'reading', 'kinesthetic']
export const personalityOptions = ['exploratory', 'structured', 'collaborative', 'self-paced']

function toggleTag(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function TagPicker({ label, options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(toggleTag(value, option))}
            className={`rounded-full border px-3 py-1 text-xs ${
              value.includes(option) ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
