export function PageState({ loading, error }) {
  if (!loading && !error) return null
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-7 md:py-8">
      {loading ? (
        <p className="text-muted-foreground">Memuat data...</p>
      ) : (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function ActionError({ message }) {
  return message ? (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null
}
