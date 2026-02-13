import React from 'react'

interface className {
  full?: boolean;
  color?: any,
  size?: any,
  className?: string;
  border?: number
  text?: string;
}

const Loader: React.FC<className> = ({ full = false, color = 'border-current', size = '8', border = 4, className, ...props }) => {
  return (
    <div {...props} className={`${full ? "w-full flex items-center justify-center min-h-40" : ''} ${className}`}>
      <div
        className={`inline-block h-${size} w-${size} animate-spin rounded-full border-${border} border-solid ${color ? color : 'border-current'} border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white`}
        role="status">
        <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Loading...</span>
      </div>
    </div>
  )
}

export default Loader