export default function HeaderSkeleton() {
  return (
   <header className="bg-[#0f0f1c] shadow-sm border-b border-[#2d2d3f] animate-pulse">
      <div className="px-1 sm:px-2 lg:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#2d2d3f] rounded-full" />
            <div className="h-6 w-32 bg-[#2d2d3f] rounded" />
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex space-x-4">
            {Array(5).fill(0).map((_, idx) => (
              <div
                key={idx}
                className="h-6 w-16 bg-[#2d2d3f] rounded"
              />
            ))}
            <div className="h-6 w-20 bg-[#3b3b4e] rounded" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <div className="h-6 w-6 bg-[#2d2d3f] rounded" />
          </div>
        </div>
      </div>
    </header>
  )
}
