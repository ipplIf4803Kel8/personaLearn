// Pilihan tag gaya belajar (VARK) & kepribadian untuk kelas. Dipakai di halaman Kelas dan Tag Jenis Konten.
export const varkOptions = ['visual', 'auditory', 'reading', 'kinesthetic']
export const personalityOptions = ['exploratory', 'structured', 'collaborative', 'self-paced']
export const mbtiOptions = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
]
export const personalityGroups = [
  { label: 'Gaya kerja', options: personalityOptions },
  { label: 'Tipe MBTI', options: mbtiOptions },
]

function toggleTag(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

// groups: [{ label, options }]; tag terpilih yang tidak ada di grup mana pun tetap tampil agar bisa dilepas.
export function TagPicker({ label, options, groups, value, onChange }) {
  const sets = groups ?? [{ label: null, options }]
  const known = new Set(sets.flatMap((group) => group.options))
  const extra = value.filter((tag) => !known.has(tag))
  const all = extra.length ? [...sets, { label: 'Lainnya', options: extra }] : sets

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {all.map((group) => (
        <div key={group.label ?? 'tags'} className="space-y-1">
          {group.label && groups && <p className="text-xs text-muted-foreground">{group.label}</p>}
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected = value.includes(option)
              return (
                <button
                  type="button"
                  key={option}
                  aria-pressed={selected}
                  onClick={() => onChange(toggleTag(value, option))}
                  className={`min-h-9 rounded-full border px-3 py-1 text-xs pointer-coarse:min-h-11 ${
                    selected ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
