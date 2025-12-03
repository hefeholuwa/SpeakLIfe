import React, { useState } from 'react'
import { FileText, Folder, Layers, Calendar, Upload } from 'lucide-react'

// Sub-panels
import DeclarationManager from './content/DeclarationManager'
import ChallengeManager from './content/ChallengeManager'
import SeriesManager from './content/SeriesManager'
import BulkUpload from './content/BulkUpload'

const ContentManagementPanel = (props) => {
  const [activeTab, setActiveTab] = useState('declarations') 

  const tabs = [
    { id: 'declarations', label: 'Declarations', icon: FileText },
    // { id: 'categories', label: 'Categories', icon: Folder }, // TODO: Implement CategoryManager
    { id: 'series', label: 'Series', icon: Layers },
    { id: 'challenges', label: 'Bootcamps', icon: Calendar },
    { id: 'bulk', label: 'Bulk Upload', icon: Upload },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'declarations' && (
          <DeclarationManager {...props} />
        )}
        
        {activeTab === 'series' && (
          <SeriesManager />
        )}
        
        {activeTab === 'challenges' && (
          <ChallengeManager />
        )}
        
        {activeTab === 'bulk' && (
          <BulkUpload onComplete={props.loadDailyContent} />
        )}
      </div>
    </div>
  )
}

export default ContentManagementPanel
