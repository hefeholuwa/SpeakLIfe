import React, { useState, useEffect } from 'react'
import { Layers, Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Card } from '../../ui/card'
import adminService from '../../../services/adminService'
import { toast } from 'sonner'

const SeriesManager = () => {
    const [seriesList, setSeriesList] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSeries, setEditingSeries] = useState(null)
    const [formData, setFormData] = useState({ title: '', description: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchSeries()
    }, [])

    const fetchSeries = async () => {
        setLoading(true)
        try {
            const data = await adminService.getContentSeries()
            setSeriesList(data || [])
        } catch (error) {
            console.error('Error fetching series:', error)
            toast.error('Failed to load series')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        setSaving(true)
        try {
            if (editingSeries) {
                await adminService.updateContentSeries(editingSeries.id, formData)
                toast.success('Series updated')
            } else {
                await adminService.createContentSeries(formData)
                toast.success('Series created')
            }
            fetchSeries()
            resetForm()
        } catch (error) {
            console.error('Error saving series:', error)
            toast.error('Failed to save series')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this series?')) return
        try {
            await adminService.deleteContentSeries(id)
            toast.success('Series deleted')
            fetchSeries()
        } catch (error) {
            console.error('Error deleting series:', error)
            toast.error('Failed to delete series')
        }
    }

    const handleEdit = (series) => {
        setEditingSeries(series)
        setFormData({ title: series.title, description: series.description || '' })
        setShowForm(true)
    }

    const resetForm = () => {
        setEditingSeries(null)
        setFormData({ title: '', description: '' })
        setShowForm(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="text-purple-600" />
                    Content Series
                </h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        New Series
                    </Button>
                )}
            </div>

            {showForm && (
                <Card className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900">{editingSeries ? 'Edit Series' : 'Create New Series'}</h4>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X size={20} />
                        </Button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., 7 Days of Anxiety Relief"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the theme of this series..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                                {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                {editingSeries ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                </div>
            ) : seriesList.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Layers className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Series Found</h3>
                    <p className="text-gray-500">Create a series to group your daily content.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {seriesList.map(series => (
                        <Card key={series.id} className="p-5 bg-white border border-gray-200 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{series.title}</h4>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(series)}>
                                        <Edit size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => handleDelete(series.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">{series.description || 'No description'}</p>
                            <div className="text-xs text-gray-400">
                                Created {new Date(series.created_at).toLocaleDateString()}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SeriesManager
