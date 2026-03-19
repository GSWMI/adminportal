import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

export function useReceiptDownload() {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState<'pdf' | 'image' | null>(null)

  const capture = async (): Promise<string | null> => {
    const el = receiptRef.current
    if (!el) {
      toast.error('Receipt element not found')
      return null
    }

    // html-to-image fully supports modern CSS including Tailwind v4's oklab colors
    return await toPng(el, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      style: {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
    })
  }

  const downloadPDF = async (filename = 'receipt') => {
    setDownloading('pdf')
    try {
      const dataUrl = await capture()
      if (!dataUrl) return

      const img = new Image()
      img.src = dataUrl

      await new Promise<void>((resolve) => { img.onload = () => resolve() })

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [img.width / 2, img.height / 2] })
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2)
      pdf.save(`${filename}.pdf`)
      toast.success('Receipt downloaded as PDF')
    } catch (err) {
      console.error('PDF download error:', err)
      toast.error('Failed to download PDF')
    } finally {
      setDownloading(null)
    }
  }

  const downloadImage = async (filename = 'receipt') => {
    setDownloading('image')
    try {
      const dataUrl = await capture()
      if (!dataUrl) return

      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Receipt downloaded as image')
    } catch (err) {
      console.error('Image download error:', err)
      toast.error('Failed to download image')
    } finally {
      setDownloading(null)
    }
  }

  return { receiptRef, downloadPDF, downloadImage, downloading }
}