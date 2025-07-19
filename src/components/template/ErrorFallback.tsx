export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="rounded border border-red-400 bg-red-100 p-4">
      <p className="font-bold">Something went wrong:</p>
      <pre className="whitespace-pre-wrap text-sm text-red-700">{error.message}</pre>
    </div>
  );
}
