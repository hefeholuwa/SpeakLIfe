import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, X, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'
import adminService from '../../../services/adminService'
import { toast } from 'sonner'

const BulkUpload = ({ onComplete }) => {
    const [file, setFile] = useState(null)
    const [previewData, setPreviewData] = useState([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please upload a valid CSV file.')
                return
            }
            setFile(selectedFile)
            parseFile(selectedFile)
        }
    }

    const parseFile = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const text = e.target.result
                const data = parseCSV(text)
                if (data.length === 0) {
                    setError('No data found in CSV.')
                    return
                }
                setPreviewData(data)
                setError(null)
            } catch (err) {
                setError('Error parsing CSV file.')
                console.error(err)
            }
        }
        reader.readAsText(file)
    }

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) return []

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''))

        // Simple CSV parser that handles quotes
        return lines.slice(1).map(line => {
            const values = []
            let currentValue = ''
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                    inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue.trim())
                    currentValue = ''
                } else {
                    currentValue += char
                }
            }
            values.push(currentValue.trim())

            const entry = {}
            headers.forEach((header, index) => {
                let value = values[index] || ''
                // Remove surrounding quotes and unescape double quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1)
                }
                value = value.replace(/""/g, '"')
                entry[header] = value
            })

            return entry
        })
    }

    const handleUpload = async () => {
        if (previewData.length === 0) return

        setUploading(true)
        let successCount = 0
        let failCount = 0

        try {
            for (const item of previewData) {
                try {
                    // Validate required fields
                    if (!item.date || !item.verse_text || !item.reference) {
                        console.warn('Skipping invalid item:', item)
                        failCount++
                        continue
                    }

                    await adminService.createDailyContent({
                        date: item.date,
                        verse_text: item.verse_text,
                        reference: item.reference,
                        confession_text: item.confession_text || '',
                        translation: item.translation || 'KJV',
                        theme: item.theme || ''
                    })
                    successCount++
                } catch (err) {
                    console.error('Error uploading item:', item, err)
                    failCount++
                }
            }

            toast.success(`Upload complete: ${successCount} added, ${failCount} failed`)
            if (onComplete) onComplete()
            setFile(null)
            setPreviewData([])
        } catch (err) {
            toast.error('Upload failed')
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Click to upload CSV</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Upload a CSV file with columns: date, verse_text, reference, confession_text, translation, theme
                    </p>
                </div>
            </Card>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {file && previewData.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-600" />
                            <div>
                                <p className="font-bold text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-500">{previewData.length} entries found</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); }}>
                            <X size={20} />
                        </Button>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Reference</th>
                                    <th className="p-3">Verse</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {previewData.slice(0, 5).map((row, i) => (
                                    <tr key={i}>
                                        <td className="p-3">{row.date}</td>
                                        <td className="p-3">{row.reference}</td>
                                        <td className="p-3 truncate max-w-xs">{row.verse_text}</td>
                                    </tr>
                                ))}
                                {previewData.length > 5 && (
                                    <tr>
                                        <td colSpan="3" className="p-3 text-center text-gray-400 italic">
                                            ...and {previewData.length - 5} more
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2" size={18} />
                                    Upload {previewData.length} Entries
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default BulkUpload
