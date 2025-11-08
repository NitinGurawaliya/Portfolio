"use client"

import Image from "next/image"

export function PortfolioMobilePreview() {
  return (
    <div className="flex justify-center items-center w-full">
      {/* Phone Frame - More zoomed out */}
      <div className="relative p-0 md:p-10 w-[240px] sm:w-[260px] md:w-[280px] lg:w-[280px] xl:w-[300px] scale-75 sm:scale-80 md:scale-85 lg:scale-95 xl:scale-100">
        {/* Phone Outline */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-1.5 shadow-2xl">
          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden relative">
            {/* Notch (Dynamic Island) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-900 rounded-full z-10" />
            
            {/* Portfolio Image */}
            <div className="relative w-full">
              <Image
                src="/portoflioimg.png"
                alt="Portfolio Preview"
                width={400}
                height={800}
                className="w-full h-auto p-0 rounded-[2rem]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

