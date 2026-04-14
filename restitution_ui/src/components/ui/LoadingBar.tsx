export function LoadingBar() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-teal-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
