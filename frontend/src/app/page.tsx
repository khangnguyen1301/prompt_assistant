export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">🎯 Prompt Assistant</h1>
        <p className="text-xl text-gray-600 text-center mt-4">
          AI-powered prompt optimization tool
        </p>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to Prompt Assistant
          </h2>
          <p className="text-lg text-gray-700 max-w-md">
            Transform your raw requests into optimized, structured prompts with
            AI assistance.
          </p>
          <div className="mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Get Started
            </button>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">🎯 Goal</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Define clear objectives for your prompts
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">📥 Input</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Specify exactly what information you need
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">📤 Output</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Get structured, optimized prompts
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">⚡ Notes</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Additional context and guidelines
          </p>
        </div>
      </div>
    </main>
  );
}
