import { MdSearch, MdTune } from 'react-icons/md'

export function SearchBar({ value, onChange, onClick, onFilter, jumlahFilter = 0, autoFocus }) {
  return (
    <div className="flex gap-4">
      <label className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-5 shadow-[0_6px_20px_rgba(36,37,44,0.06)]" onClick={onClick}>
        <MdSearch className="size-7 shrink-0 text-[#6E6A7C]" />
        <input
          autoFocus={autoFocus}
          readOnly={!onChange}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Cari sekarang ..."
          aria-label="Kata kunci"
          className="w-full bg-transparent py-4 text-base text-[#24252C] outline-none placeholder:text-[#A9A9B2]"
        />
      </label>
      <button type="button" aria-label="Filter Kelas" onClick={onFilter} className="relative flex size-[60px] shrink-0 items-center justify-center rounded-2xl bg-[#5F33E1] text-white shadow-[0_10px_20px_rgba(95,51,225,0.25)]">
        <MdTune className="size-7" />
        {jumlahFilter > 0 && <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-[#24252C]">{jumlahFilter}</span>}
      </button>
    </div>
  )
}
