export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 bg-white rounded shadow">
      <img src="/icon.png" alt="CloudText Icon" className="w-16 h-16 mb-4" />
      <h1 className="text-5xl font-bold mb-6 text-blue-700">CloudText</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl text-center">
        Your secure, cloud-based notepad. Take notes anywhere, anytime.
      </p>
      <a href="/dashboard" className="px-6 py-3 rounded bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition">
        Go to Dashboard
      </a>
    </div>
  );
}
