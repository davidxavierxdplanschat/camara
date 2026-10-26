export default function Loading() {
  return (
    <div className="container-app py-12" role="status" aria-live="polite">
      <span className="sr-only">Carregando dados...</span>
      <div className="skeleton h-36" />
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-32" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-96" />
        <div className="skeleton h-96" />
      </div>
    </div>
  );
}
