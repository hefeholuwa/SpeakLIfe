import React, { useState, useEffect } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import adminService from '../../../services/adminService'

const CalendarView = ({ onEdit, onDelete }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [monthData, setMonthData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchMonthData()
    }, [currentDate])

    const fetchMonthData = async () => {
        setLoading(true)
        try {
            const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
            const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')
            const data = await adminService.getDailyContentByRange(start, end)
            setMonthData(data)
        } catch (error) {
            console.error('Error fetching month data:', error)
        } finally {
            setLoading(false)
        }
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
        )
    }

    const renderCells = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const dateFormat = 'd'
        const rows = []
        let days = []
        let day = startDate
        let formattedDate = ''

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat)
                const cloneDay = day
                const dateKey = format(day, 'yyyy-MM-dd')
                const content = monthData.find(d => d.date === dateKey)

                days.push(
                    <div
                        key={day}
                        className={`min-h-[120px] p-2 border border-gray-100 bg-white relative group transition-colors hover:bg-gray-50
              ${!isSameMonth(day, monthStart) ? 'text-gray-300 bg-gray-50/50' : 'text-gray-900'}
              ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}
            `}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'text-blue-600' : ''}`}>
                                {formattedDate}
                            </span>
                            {isSameMonth(day, monthStart) && !content && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onEdit({ date: dateKey })}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        {content && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 text-xs cursor-pointer hover:bg-blue-100 transition-colors group/item">
                                <div className="font-bold text-blue-800 truncate">{content.reference}</div>
                                <div className="text-blue-600 truncate line-clamp-2">{content.verse_text}</div>

                                <div className="absolute top-2 right-2 hidden group-hover/item:flex gap-1 bg-white/90 rounded-md shadow-sm p-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(content); }}
                                        className="p-1 hover:text-blue-600"
                                    >
                                        <Edit size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(content.id); }}
                                        className="p-1 hover:text-red-600"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
                day = new Date(day.setDate(day.getDate() + 1)) // Use native setDate to avoid timezone issues with addDays
            }
            rows.push(
                <div className="grid grid-cols-7" key={day}>
                    {days}
                </div>
            )
            days = []
        }
        return <div className="border border-gray-200 rounded-xl overflow-hidden">{rows}</div>
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {renderHeader()}
            {renderDays()}
            {loading ? (
                <div className="h-96 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
                renderCells()
            )}
        </div>
    )
}

export default CalendarView
