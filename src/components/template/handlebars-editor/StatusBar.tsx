'use client';

export function StatusBar() {
  return (
    <div className="flex items-center justify-between border-t border-gray-700 bg-[#007acc] px-4 py-1 text-xs text-white">
      <div className="flex items-center">
        <span className="mr-4">Ln 1, Col 1</span>
        <span className="mr-4">Spaces: 2</span>
        <span className="mr-4">UTF-8</span>
        <span>Handlebars</span>
      </div>
      <div className="flex items-center">

        <span>Ready</span>
      </div>
    </div>
  );
}
