import React from 'react'

function Loader() {
  return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f0f1c] text-white space-y-4">
        <div className="flex space-x-3">
          <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-5 w-5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-5 w-5 bg-purple-500 rounded-full animate-bounce" />
        </div>
        <p className="text-lg text-white">
          "Generating testcases... Verifying against hidden inputs... 🙃"
        </p>
      </div>
  )
}

export default Loader