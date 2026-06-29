import { useState, useRef } from 'react'

function ImageUploader({ onFileSelected, label = 'Upload a food label image' }) {
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onFileSelected(file)
  }

  const handleChange = (e) => handleFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`
        relative group glass-card rounded-2xl p-8 text-center cursor-pointer
        transition-all duration-500 overflow-hidden
        ${isDragging
          ? 'border-brand-400/60 bg-brand-500/10 shadow-glow-md scale-[1.02]'
          : 'hover:border-brand-400/30 hover:bg-white/[0.06] hover:shadow-glow-sm'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Label preview"
            className="max-h-56 mx-auto rounded-xl object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-medium">Click to change</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          {/* Upload icon */}
          <div className={`
            mx-auto w-16 h-16 rounded-2xl flex items-center justify-center
            transition-all duration-500
            ${isDragging ? 'bg-brand-500/20 scale-110' : 'bg-white/[0.05] group-hover:bg-brand-500/10'}
          `}>
            <svg
              className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-brand-400' : 'text-gray-500 group-hover:text-brand-400'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <p className="text-gray-300 font-medium">{label}</p>
            <p className="text-gray-600 text-sm mt-1">Drag & drop or click to browse</p>
            <p className="text-gray-700 text-xs mt-2">JPG, PNG, or WebP • Max 10 MB</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
