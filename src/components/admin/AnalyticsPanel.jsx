import React, { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import {
    TrendingUp,
    Users,
    Activity as ActivityIcon,
    Calendar,
    BookOpen,
    Heart,
    Loader2,
    RefreshCw
} from 'lucide-react'
import adminService from '../../services/adminService'
import { toast } from 'sonner'

const AnalyticsPanel = () => {
    const [loading, setLoading] = useState(true)
    const [signupData, setSignupData] = useState([])
    const [retention, setRetention] = useState({ dau: 0, mau: 0 })
    const [popularPlans, setPopularPlans] = useState([])
    const [popularContent, setPopularContent] = useState([])

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const [signups, retentionStats, plans, content] = await Promise.all([
                adminService.getSignupGrowth(30),
                adminService.getUserRetention(),
                adminService.getPopularPlans(),
                adminService.getPopularDailyContent()
            ])

            setSignupData(Array.isArray(signups) ? signups : [])
            setRetention(retentionStats || { dau: 0, mau: 0 })
            setPopularPlans(Array.isArray(plans) ? plans : [])
            setPopularContent(Array.isArray(content) ? content : [])
        } catch (error) {
            console.error('Error fetching analytics:', error)
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{new Date(label).toLocaleDateString()}</p>
                    <p className="text-sm text-blue-600">
                        Signups: <span className="font-bold">{payload[0].value}</span>
                    </p>
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading deep analytics...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <ActivityIcon className="h-6 w-6 mr-3 text-blue-600" />
                    Deep Analytics
                </h2>
                <Button onClick={fetchAnalytics} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            {/* Retention Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Daily Active Users (DAU)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{retention.dau}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Active in last 24h
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Monthly Active Users (MAU)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{retention.mau}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Active in last 30d
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Engagement Ratio</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {retention.mau > 0 ? Math.round((retention.dau / retention.mau) * 100) : 0}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">DAU / MAU</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <ActivityIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Growth Chart */}
            <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-6">User Growth (Last 30 Days)</h3>
                <div className="h-[300px] w-full">
                    {signupData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={signupData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).getDate()}
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No growth data available yet
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Plans */}
                <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Most Popular Plans</h3>
                        <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {popularPlans.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No plan data available yet.</p>
                        ) : (
                            popularPlans.map((plan, index) => (
                                <div key={plan.plan_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold text-gray-500 border border-gray-200">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-900">{plan.plan_title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span className="font-bold text-gray-700">{plan.active_users}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Popular Content */}
                <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Top Liked Daily Content</h3>
                        <Heart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {popularContent.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No likes data available yet.</p>
                        ) : (
                            popularContent.map((content, index) => (
                                <div key={content.content_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold text-gray-500 border border-gray-200">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">{content.reference}</p>
                                            <p className="text-xs text-gray-500">{content.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-600">
                                        <Heart className="h-4 w-4 fill-current" />
                                        <span className="font-bold">{content.likes_count}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default AnalyticsPanel
