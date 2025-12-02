import { useState, useEffect } from 'react'
import { X, Sparkles, Plus, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const DeclarationBuilder = ({ onClose, onComplete, editDeclaration = null }) => {
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const [lifeAreas, setLifeAreas] = useState([])
    const [loading, setLoading] = useState(false)

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
        } catch (error) {
            console.error('Error fetching life areas:', error)
            toast.error('Failed to load life areas')
        }
    }

    const handleSave = async () => {
        if (!formData.life_area_id || !formData.title || !formData.declaration_text) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            if (editDeclaration) {
                // Update existing declaration
                const { error } = await supabase
                    .from('user_declarations')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editDeclaration.id)
                    .eq('user_id', user.id)

                if (error) throw error
                toast.success('Declaration updated!')
            } else {
                // Create new declaration
                const { error } = await supabase
                    .from('user_declarations')
                    .insert([{
                        user_id: user.id,
                        ...formData
                    }])

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

    const selectedArea = lifeAreas.find(area => area.id === formData.life_area_id)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">
                            {editDeclaration ? 'Edit Declaration' : 'Create New Declaration'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Step {step} of 3 • {step === 1 ? 'Choose Area' : step === 2 ? 'Write Declaration' : 'Add Scripture'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Choose Life Area */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Which area of life is this declaration for?
                                </h3>
                                <p className="text-gray-600">
                                    Select the category that best fits your declaration
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {lifeAreas.map((area) => (
                                    <button
                                        key={area.id}
                                        onClick={() => setFormData({ ...formData, life_area_id: area.id })}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left ${formData.life_area_id === area.id
                                                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-3xl">{area.icon}</span>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{area.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {area.description}
                                                </p>
                                            </div>
                                            {formData.life_area_id === area.id && (
                                                <Check size={20} className="text-purple-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Write Declaration */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                                    <span className="text-2xl">{selectedArea?.icon}</span>
                                    <span className="font-bold text-purple-900">{selectedArea?.name}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Write your declaration
                                </h3>
                                <p className="text-gray-600">
                                    Speak it in present tense, as if it's already true
                                </p>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., I Am Financially Blessed"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Declaration Text */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Declaration <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.declaration_text}
                                    onChange={(e) => setFormData({ ...formData, declaration_text: e.target.value })}
                                    placeholder="I am blessed and highly favored. God provides for all my needs according to His riches in glory. I walk in abundance and overflow in every area of my life."
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Tip: Use "I am" statements and present tense for maximum impact
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Add Scripture (Optional) */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center mb-6">
                                <Sparkles size={48} className="mx-auto text-purple-500 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Add a Bible verse (optional)
                                </h3>
                                <p className="text-gray-600">
                                    Ground your declaration in Scripture
                                </p>
                            </div>

                            {/* Bible Reference */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Bible Reference
                                </label>
                                <input
                                    type="text"
                                    value={formData.bible_reference}
                                    onChange={(e) => setFormData({ ...formData, bible_reference: e.target.value })}
                                    placeholder="e.g., Philippians 4:19"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Bible Verse Text */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Verse Text
                                </label>
                                <textarea
                                    value={formData.bible_verse_text}
                                    onChange={(e) => setFormData({ ...formData, bible_verse_text: e.target.value })}
                                    placeholder="And my God will meet all your needs according to the riches of his glory in Christ Jesus."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            {/* Preview */}
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                                <p className="text-sm font-bold text-purple-900 mb-2">Preview</p>
                                <p className="text-gray-800 font-medium mb-2">{formData.title || 'Your Title'}</p>
                                <p className="text-gray-700 text-sm italic">"{formData.declaration_text || 'Your declaration...'}"</p>
                                {formData.bible_reference && (
                                    <p className="text-xs text-purple-700 mt-3 font-medium">
                                        — {formData.bible_reference}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        <ArrowLeft size={20} />
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !formData.life_area_id) {
                                    toast.error('Please select a life area')
                                    return
                                }
                                if (step === 2 && (!formData.title || !formData.declaration_text)) {
                                    toast.error('Please fill in title and declaration')
                                    return
                                }
                                setStep(step + 1)
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Next
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    {editDeclaration ? 'Update' : 'Create'} Declaration
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <style jsx="true">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    )
}

export default DeclarationBuilder
