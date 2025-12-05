import { useState, useEffect } from 'react'
import { X, Sparkles, Plus, Check, ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const DeclarationBuilder = ({ onClose, onComplete, editDeclaration = null }) => {
    const { user } = useAuth()
    const [lifeAreas, setLifeAreas] = useState([])
    const [loading, setLoading] = useState(false)
    const [showBibleSection, setShowBibleSection] = useState(!!editDeclaration?.bible_reference)

    // Form state
    const [formData, setFormData] = useState({
        life_area_id: editDeclaration?.life_area_id || '',
        title: editDeclaration?.title || '',
        declaration_text: editDeclaration?.declaration_text || '',
        bible_reference: editDeclaration?.bible_reference || '',
        bible_verse_text: editDeclaration?.bible_verse_text || ''
    })

    useEffect(() => {
        fetchLifeAreas()
    }, [])

    const fetchLifeAreas = async () => {
        try {
            const { data, error } = await supabase
                .from('life_areas')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')

            if (error) throw error
            setLifeAreas(data || [])

            // Smart Default: If creating new and no area selected, default to first one (usually 'Faith' or 'General')
            if (!editDeclaration && data && data.length > 0) {
                setFormData(prev => ({ ...prev, life_area_id: data[0].id }))
            }
        } catch (error) {
            console.error('Error fetching life areas:', error)
            toast.error('Failed to load life areas')
        }
    }

    const handleSave = async () => {
        if (!formData.title || !formData.declaration_text) {
            toast.error('Please add a title and declaration text')
            return
        }

        // Fallback if somehow no area is selected
        const finalAreaId = formData.life_area_id || (lifeAreas.length > 0 ? lifeAreas[0].id : null)

        setLoading(true)
        try {
            const payload = {
                ...formData,
                life_area_id: finalAreaId,
                user_id: user.id
            }

            if (editDeclaration) {
                const { error } = await supabase
                    .from('user_declarations')
                    .update({
                        ...payload,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editDeclaration.id)
                    .eq('user_id', user.id)

                if (error) throw error
                toast.success('Declaration updated!')
            } else {
                const { error } = await supabase
                    .from('user_declarations')
                    .insert([payload])

                if (error) throw error
                toast.success('Declaration created!')
            }

            onComplete?.()
            onClose()
        } catch (error) {
            console.error('Error saving declaration:', error)
            toast.error('Failed to save declaration')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in pb-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-white">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <ArrowLeft size={24} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">
                            {editDeclaration ? 'Edit Declaration' : 'New Declaration'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            {editDeclaration ? 'Update your declaration details' : 'Speak something new into existence'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8">

                    {/* 1. Title Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., I Am Confident"
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-500 focus:outline-none transition-all font-bold text-xl text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                            autoFocus
                        />
                    </div>

                    {/* 2. Declaration Text Area */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Declaration
                        </label>
                        <textarea
                            value={formData.declaration_text}
                            onChange={(e) => setFormData({ ...formData, declaration_text: e.target.value })}
                            placeholder="Speak it into existence..."
                            rows={6}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-500 focus:outline-none transition-all resize-none text-lg leading-relaxed text-gray-800 placeholder:text-gray-400"
                        />
                    </div>

                    {/* 3. Category Selection (Pills) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Category
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {lifeAreas.map((area) => (
                                <button
                                    key={area.id}
                                    onClick={() => setFormData({ ...formData, life_area_id: area.id })}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${formData.life_area_id === area.id
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg">{area.icon}</span>
                                    {area.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Optional Bible Section (Collapsible) */}
                    <div className="border-t border-gray-100 pt-6">
                        <button
                            onClick={() => setShowBibleSection(!showBibleSection)}
                            className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors w-full group"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <Sparkles size={16} />
                            </div>
                            {showBibleSection ? 'Hide Scripture' : 'Add Scripture Reference (Optional)'}
                            {showBibleSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showBibleSection && (
                            <div className="mt-6 space-y-4 animate-fade-in pl-2 border-l-2 border-purple-100 ml-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        type="text"
                                        value={formData.bible_reference}
                                        onChange={(e) => setFormData({ ...formData, bible_reference: e.target.value })}
                                        placeholder="Reference (e.g. Phil 4:13)"
                                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-100 focus:border-purple-300 focus:outline-none text-sm font-medium"
                                    />
                                    <textarea
                                        value={formData.bible_verse_text}
                                        onChange={(e) => setFormData({ ...formData, bible_verse_text: e.target.value })}
                                        placeholder="Verse text..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-100 focus:border-purple-300 focus:outline-none text-sm resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Check size={20} />
                                Save Declaration
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx="true">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    )
}

export default DeclarationBuilder
