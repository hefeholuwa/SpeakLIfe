import React, { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    ChevronRight,
    Calendar,
    Check,
    Sparkles,
    Loader2
} from 'lucide-react'
import aiGenerationService from '../../services/aiGenerationService'
import { supabase } from '../../supabaseClient'
import { toast } from 'sonner'

const ReadingPlansPanel = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showPlanForm, setShowPlanForm] = useState(false)

    // Plan Form Data
    const [planFormData, setPlanFormData] = useState({
        title: '',
        description: '',
        duration_days: 30,
        image_gradient: 'from-blue-500 to-cyan-500'
    })

    // Days Management
    const [planDays, setPlanDays] = useState([])
    const [loadingDays, setLoadingDays] = useState(false)
    const [editingDay, setEditingDay] = useState(null)
    const [dayFormData, setDayFormData] = useState({
        day_number: 1,
        reading_reference: '',
        devotional_content: ''
    })
    const [keepDayNumber, setKeepDayNumber] = useState(false)

    // AI Generation State
    const [showAIModal, setShowAIModal] = useState(false)
    const [aiTopic, setAiTopic] = useState('')
    const [aiDuration, setAiDuration] = useState(7)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        fetchPlans()
    }, [])

    useEffect(() => {
        if (selectedPlan) {
            fetchPlanDays(selectedPlan.id)
        }
    }, [selectedPlan])

    const fetchPlans = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('reading_plans')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPlans(data || [])
        } catch (error) {
            console.error('Error fetching plans:', error)
            toast.error('Failed to load reading plans')
        } finally {
            setLoading(false)
        }
    }

    const fetchPlanDays = async (planId) => {
        try {
            setLoadingDays(true)
            const { data, error } = await supabase
                .from('reading_plan_days')
                .select('*')
                .eq('plan_id', planId)
                .order('day_number', { ascending: true })

            if (error) throw error
            setPlanDays(data || [])

            // Set next day number automatically
            const nextDay = (data?.length || 0) + 1
            setDayFormData(prev => ({ ...prev, day_number: nextDay }))
        } catch (error) {
            console.error('Error fetching plan days:', error)
            toast.error('Failed to load plan days')
        } finally {
            setLoadingDays(false)
        }
    }

    const handlePlanSubmit = async (e) => {
        e.preventDefault()
        try {
            if (isEditing && selectedPlan) {
                const { error } = await supabase
                    .from('reading_plans')
                    .update(planFormData)
                    .eq('id', selectedPlan.id)

                if (error) throw error
                toast.success('Plan updated successfully')
            } else {
                const { error } = await supabase
                    .from('reading_plans')
                    .insert([planFormData])

                if (error) throw error
                toast.success('Plan created successfully')
            }

            setShowPlanForm(false)
            setIsEditing(false)
            setPlanFormData({
                title: '',
                description: '',
                duration_days: 30,
                image_gradient: 'from-blue-500 to-cyan-500'
            })
            fetchPlans()
        } catch (error) {
            console.error('Error saving plan:', error)
            toast.error('Failed to save plan')
        }
    }

    const handleDeletePlan = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plan? This will also delete all associated days.')) return

        try {
            // Delete days first (though cascade might handle it, better safe)
            await supabase.from('reading_plan_days').delete().eq('plan_id', id)

            const { error } = await supabase
                .from('reading_plans')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Plan deleted successfully')

            if (selectedPlan?.id === id) {
                setSelectedPlan(null)
            }
            fetchPlans()
        } catch (error) {
            console.error('Error deleting plan:', error)
            toast.error('Failed to delete plan')
        }
    }

    const handleDaySubmit = async (e) => {
        e.preventDefault()
        if (!selectedPlan) return

        try {
            if (editingDay) {
                // Edit mode - single entry update
                const { error } = await supabase
                    .from('reading_plan_days')
                    .update(dayFormData)
                    .eq('id', editingDay.id)

                if (error) throw error
                toast.success('Day updated successfully')
            } else {
                // Create mode - support parsing
                const input = dayFormData.reading_reference.trim()
                let references = []

                // 1. Check for Range: "Genesis 1-3" or "Genesis 1 - 3"
                const rangeMatch = input.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)$/)

                if (rangeMatch) {
                    const book = rangeMatch[1]
                    const start = parseInt(rangeMatch[2])
                    const end = parseInt(rangeMatch[3])

                    if (start <= end) {
                        for (let i = start; i <= end; i++) {
                            references.push(`${book} ${i}`)
                        }
                    }
                }
                // 2. Check for Comma Separated: "Genesis 1, Exodus 2"
                else if (input.includes(',')) {
                    references = input.split(',').map(s => s.trim()).filter(Boolean)
                }
                // 3. Single Reference
                else {
                    references = [input]
                }

                // Create entries
                const entries = references.map(ref => ({
                    plan_id: selectedPlan.id,
                    day_number: dayFormData.day_number,
                    reading_reference: ref,
                    devotional_content: dayFormData.devotional_content
                }))

                const { error } = await supabase
                    .from('reading_plan_days')
                    .insert(entries)

                if (error) throw error
                toast.success(`Added ${entries.length} reading(s) successfully`)
            }

            setEditingDay(null)
            // Auto-increment only if not keeping day number
            setDayFormData(prev => ({
                day_number: editingDay ? prev.day_number : (keepDayNumber ? prev.day_number : prev.day_number + 1),
                reading_reference: '',
                devotional_content: ''
            }))
            fetchPlanDays(selectedPlan.id)
        } catch (error) {
            console.error('Error saving day:', error)
            toast.error('Failed to save day')
        }
    }

    const handleDeleteDay = async (id) => {
        if (!window.confirm('Delete this day?')) return

        try {
            const { error } = await supabase
                .from('reading_plan_days')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Day deleted successfully')
            fetchPlanDays(selectedPlan.id)
        } catch (error) {
            console.error('Error deleting day:', error)
            toast.error('Failed to delete day')
        }
    }

    const handleAIGenerate = async (e) => {
        e.preventDefault()
        if (!aiTopic.trim()) return

        try {
            setIsGenerating(true)
            toast.info('Generating plan with AI... This may take a minute.')

            // 1. Generate Plan Data
            const generatedPlan = await aiGenerationService.generateReadingPlan(aiTopic, aiDuration)

            // 2. Create Plan in DB
            const { data: planData, error: planError } = await supabase
                .from('reading_plans')
                .insert([{
                    title: generatedPlan.title,
                    description: generatedPlan.description,
                    duration_days: generatedPlan.duration_days,
                    image_gradient: generatedPlan.image_gradient
                }])
                .select()
                .single()

            if (planError) throw planError

            // 3. Create Days in DB
            const daysToInsert = generatedPlan.days.map(day => ({
                plan_id: planData.id,
                day_number: day.day_number,
                reading_reference: day.reading_reference,
                devotional_content: day.devotional_content
            }))

            const { error: daysError } = await supabase
                .from('reading_plan_days')
                .insert(daysToInsert)

            if (daysError) throw daysError

            toast.success('AI Plan generated and saved successfully!')
            setShowAIModal(false)
            setAiTopic('')
            fetchPlans()

        } catch (error) {
            console.error('Error generating AI plan:', error)
            toast.error(error.message || 'Failed to generate plan')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            {!selectedPlan ? (
                // Plans List View
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Reading Plans</h2>
                            <p className="text-gray-500">Manage Bible reading plans and schedules</p>
                        </div>
                        <Button onClick={() => {
                            setPlanFormData({
                                title: '',
                                description: '',
                                duration_days: 30,
                                image_gradient: 'from-blue-500 to-cyan-500'
                            })
                            setIsEditing(false)
                            setShowPlanForm(true)
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Plan
                        </Button>
                        <Button
                            variant="outline"
                            className="ml-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => setShowAIModal(true)}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate with AI
                        </Button>
                    </div>

                    {/* AI Generation Modal */}
                    {showAIModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in-95 bg-white shadow-2xl border-0">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        Generate Reading Plan
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowAIModal(false)} disabled={isGenerating} className="hover:bg-gray-100 rounded-full">
                                        <X className="h-5 w-5 text-gray-500" />
                                    </Button>
                                </div>

                                <form onSubmit={handleAIGenerate} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Topic or Theme</label>
                                        <Input
                                            required
                                            value={aiTopic}
                                            onChange={e => setAiTopic(e.target.value)}
                                            placeholder="e.g., Overcoming Anxiety, The Book of Romans..."
                                            disabled={isGenerating}
                                            className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Duration (Days)</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={aiDuration}
                                            onChange={e => setAiDuration(parseInt(e.target.value))}
                                            disabled={isGenerating}
                                        >
                                            <option value={3}>3 Days</option>
                                            <option value={5}>5 Days</option>
                                            <option value={7}>7 Days</option>
                                            <option value={14}>14 Days</option>
                                            <option value={21}>21 Days</option>
                                            <option value={30}>30 Days</option>
                                        </select>
                                    </div>

                                    <div className="pt-2 flex justify-end gap-3">
                                        <Button type="button" variant="ghost" onClick={() => setShowAIModal(false)} disabled={isGenerating} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Generate Plan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    {showPlanForm && (
                        <Card className="p-6 border-2 border-blue-100 animate-in fade-in slide-in-from-top-4">
                            <form onSubmit={handlePlanSubmit} className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg">{isEditing ? 'Edit Plan' : 'Create New Plan'}</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowPlanForm(false)} type="button">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            required
                                            value={planFormData.title}
                                            onChange={e => setPlanFormData({ ...planFormData, title: e.target.value })}
                                            placeholder="e.g., Gospel in 90 Days"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Duration (Days)</label>
                                        <Input
                                            type="number"
                                            required
                                            value={planFormData.duration_days}
                                            onChange={e => setPlanFormData({ ...planFormData, duration_days: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            required
                                            value={planFormData.description}
                                            onChange={e => setPlanFormData({ ...planFormData, description: e.target.value })}
                                            placeholder="Brief description of the plan..."
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Gradient Style (Tailwind classes)</label>
                                        <Input
                                            value={planFormData.image_gradient}
                                            onChange={e => setPlanFormData({ ...planFormData, image_gradient: e.target.value })}
                                            placeholder="from-blue-500 to-cyan-500"
                                        />
                                        <div className={`h-8 rounded-md mt-2 bg-gradient-to-br ${planFormData.image_gradient}`}></div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" type="button" onClick={() => setShowPlanForm(false)}>Cancel</Button>
                                    <Button type="submit">
                                        <Save className="h-4 w-4 mr-2" />
                                        {isEditing ? 'Update Plan' : 'Create Plan'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 border border-gray-100 cursor-pointer"
                                onClick={() => setSelectedPlan(plan)}
                            >
                                {/* Premium Header with Gradient & Overlay */}
                                <div className={`relative h-48 w-full overflow-hidden bg-gradient-to-br ${plan.image_gradient}`}>
                                    {/* Texture Overlay (Optional - CSS pattern) */}
                                    <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>

                                    {/* Dark Gradient for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                    {/* Action Buttons (Glassmorphism) */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setPlanFormData(plan)
                                                setIsEditing(true)
                                                setShowPlanForm(true)
                                            }}
                                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
                                            title="Edit Plan"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeletePlan(plan.id)
                                            }}
                                            className="p-2.5 bg-white/10 hover:bg-red-500/80 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
                                            title="Delete Plan"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Title Section */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <h3 className="text-2xl font-bold text-white tracking-tight leading-snug drop-shadow-lg line-clamp-2">
                                            {plan.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="flex flex-1 flex-col justify-between p-6 pt-4">
                                    <div className="space-y-4">
                                        {/* Metadata Badge */}
                                        <div className="flex items-center gap-2">
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-100">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {plan.duration_days} Days
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                            {plan.description || "No description provided."}
                                        </p>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="mt-6 flex items-center text-sm font-semibold text-gray-900 group/btn">
                                        <span>Manage Content</span>
                                        <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 text-gray-400 group-hover/btn:text-gray-900" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Single Plan Management View
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setSelectedPlan(null)}>
                            <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                            Back to Plans
                        </Button>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.title}</h2>
                        <Badge variant="secondary">{planDays.length} / {selectedPlan.duration_days} Days</Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Days List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 flex justify-between items-center">
                                    <span>Plan Schedule</span>
                                    <span className="text-sm text-gray-500">{planDays.length} entries</span>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                    {planDays.map(day => (
                                        <div key={day.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {day.day_number}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{day.reading_reference}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingDay(day)
                                                        setDayFormData({
                                                            day_number: day.day_number,
                                                            reading_reference: day.reading_reference,
                                                            devotional_content: day.devotional_content || ''
                                                        })
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDeleteDay(day.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {planDays.length === 0 && (
                                        <div className="p-8 text-center text-gray-500">
                                            No days added yet. Use the form to add content.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add/Edit Day Form */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-6">
                                <h3 className="font-bold text-lg mb-4">{editingDay ? 'Edit Day' : 'Add Day'}</h3>
                                <form onSubmit={handleDaySubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Day Number</label>
                                        <Input
                                            type="number"
                                            required
                                            value={dayFormData.day_number}
                                            onChange={e => setDayFormData({ ...dayFormData, day_number: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Reading Reference</label>
                                        <Input
                                            required
                                            value={dayFormData.reading_reference}
                                            onChange={e => setDayFormData({ ...dayFormData, reading_reference: e.target.value })}
                                            placeholder="e.g., Genesis 1 or Genesis 1-3"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Supports ranges (e.g., "Genesis 1-3") and lists (e.g., "Genesis 1, Exodus 2").
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Devotional Content (Optional)</label>
                                        <Textarea
                                            value={dayFormData.devotional_content}
                                            onChange={e => setDayFormData({ ...dayFormData, devotional_content: e.target.value })}
                                            placeholder="Enter a short devotional thought or prayer..."
                                            className="h-24"
                                        />
                                    </div>

                                    {!editingDay && (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="keepDayNumber"
                                                checked={keepDayNumber}
                                                onChange={(e) => setKeepDayNumber(e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="keepDayNumber" className="text-sm text-gray-600 select-none cursor-pointer">
                                                Add another reading for this day (don't increment day #)
                                            </label>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        {editingDay && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setEditingDay(null)
                                                    setDayFormData({
                                                        day_number: planDays.length + 1,
                                                        reading_reference: '',
                                                        devotional_content: ''
                                                    })
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button type="submit" className="flex-1">
                                            {editingDay ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                            {editingDay ? 'Update' : 'Add'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReadingPlansPanel
