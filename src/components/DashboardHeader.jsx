import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'

const DashboardHeader = ({ onShowProfile }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="border-b border-gray-200/50 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-black text-lg sm:text-2xl">SL</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-800">SpeakLife</h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">One Confession at a Time</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-purple-100 transition-all duration-300 group">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-300">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm sm:text-lg group-hover:scale-110 transition-transform duration-300">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 sm:w-64 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-xl sm:rounded-2xl p-2 z-50" align="end">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <DropdownMenuItem className="cursor-pointer p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-purple-50 transition-all duration-300" onClick={() => onShowProfile?.(true)}>
                <span className="mr-2 sm:mr-3 text-base sm:text-lg">👤</span>
                <span className="font-medium text-sm sm:text-base">Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-purple-50 transition-all duration-300">
                <span className="mr-2 sm:mr-3 text-base sm:text-lg">⚙️</span>
                <span className="font-medium text-sm sm:text-base">Settings</span>
              </DropdownMenuItem>
              
              <div className="border-t border-gray-100 my-1 sm:my-2"></div>
              
              <DropdownMenuItem className="cursor-pointer p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-red-50 text-red-600 transition-all duration-300" onClick={handleSignOut}>
                <span className="mr-2 sm:mr-3 text-base sm:text-lg">🚪</span>
                <span className="font-medium text-sm sm:text-base">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
