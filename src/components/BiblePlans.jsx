import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronRight, ArrowLeft, Calendar, Award, Book, Sparkles, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BiblePlans = ({ onStartReading, onBack }) => {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [planDays, setPlanDays] = useState([]);
    const [userProgress, setUserProgress] = useState(new Set());
    const [startedPlanIds, setStartedPlanIds] = useState(new Set());
    const [showManageMenu, setShowManageMenu] = useState(false);

    // Fetch all available plans and user's started plans
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Plans
                const { data: plansData, error: plansError } = await supabase
                    .from('reading_plans')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (plansError) throw plansError;
                setPlans(plansData || []);

                // 2. Fetch Started Plans (if user logged in)
                if (user) {
                    const { data: progressData, error: progressError } = await supabase
                        .from('user_plan_progress')
                        .select('plan_id')
                        .eq('user_id', user.id);

                    if (progressError) throw progressError;

                    // Create a Set of unique plan IDs the user has started
                    const startedIds = new Set(progressData?.map(p => p.plan_id) || []);
                    setStartedPlanIds(startedIds);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Fetch details for a specific plan
    const fetchPlanDetails = async (plan) => {
        // Check if user already has a started plan and is trying to open a different one
        if (startedPlanIds.size > 0 && !startedPlanIds.has(plan.id)) {
            toast.error("Finish your current plan first", {
                description: "You can only have one active reading plan at a time. Please finish or quit your current plan to start a new one.",
                icon: <AlertCircle className="text-red-500" />,
                duration: 4000
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Get all days for this plan
            const { data: daysData } = await supabase
                .from('reading_plan_days')
                .select('*')
                .eq('plan_id', plan.id)
                .order('day_number', { ascending: true });

            setPlanDays(daysData || []);

            // 2. Get user's progress for this plan
            if (user) {
                const { data: progressData } = await supabase
                    .from('user_plan_progress')
                    .select('day_id')
                    .eq('user_id', user.id)
                    .eq('plan_id', plan.id);

                const progressSet = new Set(progressData?.map(p => p.day_id) || []);
                setUserProgress(progressSet);
            }

            setSelectedPlan(plan);
            setShowManageMenu(false); // Reset menu state
        } catch (error) {
            console.error('Error fetching plan details:', error);
        } finally {
            setLoading(false);
        }
    };

    const [confirmAction, setConfirmAction] = useState(null); // 'restart' | 'quit' | null

    const resetMenu = () => {
        setConfirmAction(null);
        setShowManageMenu(false);
    };

    // Restart the current plan
    const executeRestartPlan = async () => {
        if (!user || !selectedPlan) return;

        try {
            const { error } = await supabase
                .from('user_plan_progress')
                .delete()
                .eq('user_id', user.id)
                .eq('plan_id', selectedPlan.id);

            if (error) throw error;

            setUserProgress(new Set());
            toast.success("Plan restarted successfully");
            resetMenu();
        } catch (error) {
            console.error('Error restarting plan:', error);
            toast.error("Failed to restart plan");
        }
    };

    // Quit the current plan
    const executeQuitPlan = async () => {
        if (!user || !selectedPlan) return;

        try {
            const { error } = await supabase
                .from('user_plan_progress')
                .delete()
                .eq('user_id', user.id)
                .eq('plan_id', selectedPlan.id);

            if (error) throw error;

            // Update local state
            const newStarted = new Set(startedPlanIds);
            newStarted.delete(selectedPlan.id);
            setStartedPlanIds(newStarted);

            setSelectedPlan(null);
            toast.success("Plan quit successfully");
            resetMenu();
        } catch (error) {
            console.error('Error quitting plan:', error);
            toast.error("Failed to quit plan");
        }
    };

    // Toggle completion status of a day
    const toggleDayCompletion = async (dayId, e) => {
        e.stopPropagation(); // Prevent opening the reading
        if (!user) return;

        try {
            if (userProgress.has(dayId)) {
                // Remove progress
                await supabase
                    .from('user_plan_progress')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('day_id', dayId);

                const newProgress = new Set(userProgress);
                newProgress.delete(dayId);
                setUserProgress(newProgress);

                // If no progress left, remove from started plans locally (optional, but keeps UI sync)
                if (newProgress.size === 0) {
                    const newStarted = new Set(startedPlanIds);
                    newStarted.delete(selectedPlan.id);
                    setStartedPlanIds(newStarted);
                }

            } else {
                // Add progress
                await supabase
                    .from('user_plan_progress')
                    .insert({
                        user_id: user.id,
                        plan_id: selectedPlan.id,
                        day_id: dayId
                    });

                const newProgress = new Set(userProgress);
                newProgress.add(dayId);
                setUserProgress(newProgress);

                // Add to started plans locally
                const newStarted = new Set(startedPlanIds);
                newStarted.add(selectedPlan.id);
                setStartedPlanIds(newStarted);
            }
        } catch (error) {
            console.error('Error toggling progress:', error);
        }
    };

    if (loading && !selectedPlan && plans.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (selectedPlan) {
        const progressPercentage = Math.round((userProgress.size / (planDays.length || 1)) * 100);
        const isStarted = startedPlanIds.has(selectedPlan.id);

        // Group days
        const groupedDays = planDays.reduce((acc, day) => {
            if (!acc[day.day_number]) acc[day.day_number] = [];
            acc[day.day_number].push(day);
            return acc;
        }, {});

        // Find next reading
        let nextDayNum = null;
        for (let i = 1; i <= planDays.length; i++) {
            const days = groupedDays[i];
            if (days && days.some(d => !userProgress.has(d.id))) {
                nextDayNum = i;
                break;
            }
        }

        // If all done, maybe show the last one or a "Complete" state
        const nextReadingDay = nextDayNum ? groupedDays[nextDayNum] : null;

        return (
            <div className="space-y-8 animate-fade-in pb-20">
                {/* Navigation & Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedPlan(null)}
                        className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
                    >
                        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        Back to Plans
                    </button>

                    {/* Manage Menu */}
                    {isStarted && (
                        <div className="relative">
                            <button
                                onClick={() => setShowManageMenu(!showManageMenu)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                            >
                                Manage Plan
                            </button>

                            {showManageMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                    {!confirmAction ? (
                                        <>
                                            <button
                                                onClick={() => setConfirmAction('restart')}
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <RefreshCw size={16} className="text-blue-500" /> Restart Plan
                                            </button>
                                            <button
                                                onClick={() => setConfirmAction('quit')}
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                            >
                                                <Trash2 size={16} /> Quit Plan
                                            </button>
                                        </>
                                    ) : (
                                        <div className="p-4 bg-gray-50">
                                            <p className="text-xs text-gray-600 mb-3 font-medium leading-relaxed">
                                                {confirmAction === 'restart'
                                                    ? "Restarting will clear all your progress. Are you sure?"
                                                    : "Quitting will remove this plan from your list. Are you sure?"}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setConfirmAction(null)}
                                                    className="flex-1 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={confirmAction === 'restart' ? executeRestartPlan : executeQuitPlan}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold text-white shadow-sm ${confirmAction === 'restart'
                                                            ? "bg-blue-600 hover:bg-blue-700"
                                                            : "bg-red-600 hover:bg-red-700"
                                                        }`}
                                                >
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Immersive Header */}
                <div className={`relative overflow-hidden rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 text-white bg-gradient-to-br ${selectedPlan.image_gradient} shadow-xl md:shadow-2xl`}>
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
                        <div className="flex-1 space-y-4 md:space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider">
                                <Calendar size={12} />
                                {selectedPlan.duration_days} Days
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                    {selectedPlan.title}
                                </h1>
                                <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                    {selectedPlan.description}
                                </p>
                            </div>

                            {/* Progress Section */}
                            {isStarted && (
                                <div className="space-y-3 max-w-md pt-2 md:pt-4">
                                    <div className="flex justify-between text-sm font-bold text-white/90">
                                        <span>Your Progress</span>
                                        <span>{progressPercentage}%</span>
                                    </div>
                                    <div className="bg-black/20 rounded-full h-2.5 w-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-white/70 font-medium">
                                        {userProgress.size} of {planDays.length} readings completed
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg">
                                <Award size={48} className="text-white drop-shadow-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* "Next Up" Call to Action */}
                {nextReadingDay && (
                    <div className="animate-fade-in-up">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={20} />
                            Up Next
                        </h2>
                        {(() => {
                            const nextUnread = nextReadingDay.find(d => !userProgress.has(d.id)) || nextReadingDay[0];
                            const remainingCount = nextReadingDay.filter(d => !userProgress.has(d.id)).length;

                            return (
                                <div
                                    onClick={() => {
                                        onStartReading(nextUnread.reading_reference, selectedPlan.id, nextUnread.id, nextUnread.devotional_content, nextUnread.day_number);
                                    }}
                                    className="group cursor-pointer relative overflow-hidden rounded-3xl bg-gray-900 text-white p-6 md:p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-blue-900 opacity-50" />
                                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-black/50 to-transparent" />

                                    <div className="relative z-10 flex items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-xs md:text-sm mb-2">
                                                <span>Day {nextUnread.day_number}</span>
                                                {remainingCount > 1 && (
                                                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                                                        +{remainingCount - 1} more
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl md:text-4xl font-black mb-2 leading-tight">
                                                {nextUnread.reading_reference}
                                            </h3>
                                            <p className="text-gray-300 text-sm md:text-base line-clamp-1">
                                                Tap to start your daily reading
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white text-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shrink-0">
                                            <Book size={24} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Full Schedule List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Full Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(groupedDays).map(([dayNum, days]) => {
                            const totalReadings = days.length;
                            const completedReadings = days.filter(d => userProgress.has(d.id));
                            const isDayComplete = completedReadings.length === totalReadings;
                            const isNext = parseInt(dayNum) === nextDayNum;

                            // Get first reading for click handler
                            const firstReading = days[0];
                            const nextUnread = days.find(d => !userProgress.has(d.id)) || firstReading;

                            return (
                                <div
                                    key={dayNum}
                                    onClick={() => onStartReading(nextUnread.reading_reference, selectedPlan.id, nextUnread.id, nextUnread.devotional_content, nextUnread.day_number)}
                                    className={`group p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${isDayComplete
                                        ? 'bg-green-50/50 border-green-100'
                                        : isNext
                                            ? 'bg-white border-purple-200 shadow-md ring-1 ring-purple-100'
                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isDayComplete
                                            ? 'bg-green-100 text-green-600'
                                            : isNext
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {isDayComplete ? <CheckCircle size={18} /> : dayNum}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${isDayComplete ? 'text-green-900' : 'text-gray-900'}`}>
                                                {days.map(d => d.reading_reference).join(', ')}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                                                {isDayComplete ? 'Completed' : `${totalReadings} Reading${totalReadings > 1 ? 's' : ''}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isNext ? 'opacity-100' : ''}`}>
                                        <div className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>


            </div>
        );
    }

    const startedPlans = plans.filter(plan => startedPlanIds.has(plan.id));
    const availablePlans = plans.filter(plan => !startedPlanIds.has(plan.id));

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Reading Plans</h1>
                    <p className="text-gray-500">Structured paths for your spiritual journey.</p>
                </div>
            </div>

            {/* Started Plans Section */}
            {startedPlans.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Award size={20} className="text-purple-600" />
                        Continue Reading
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {startedPlans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => fetchPlanDetails(plan)}
                                className="group relative overflow-hidden bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left h-full flex flex-col ring-2 ring-purple-50"
                            >
                                <div className={`min-h-24 bg-gradient-to-br ${plan.image_gradient} p-6 relative overflow-hidden flex flex-col justify-center`}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6" />
                                    <div className="relative z-10">
                                        <span className="inline-block px-2 py-0.5 bg-black/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-white mb-2">
                                            IN PROGRESS
                                        </span>
                                        <h3 className="text-lg font-black text-white leading-tight">{plan.title}</h3>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:translate-x-1 transition-transform mt-2">
                                        Continue <ChevronRight size={16} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* All Plans Section */}
            <div className="space-y-4">
                {startedPlans.length > 0 && (
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-8">
                        <Book size={20} className="text-gray-600" />
                        All Plans
                    </h2>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePlans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => fetchPlanDetails(plan)}
                            className="group relative overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left h-full flex flex-col"
                        >
                            {/* Card Header with Gradient */}
                            <div className={`min-h-32 bg-gradient-to-br ${plan.image_gradient} p-6 relative overflow-hidden flex flex-col justify-between`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                                <div className="relative z-10">
                                    <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-xs font-bold text-white mb-3">
                                        {plan.duration_days} Days
                                    </span>
                                    <h3 className="text-xl font-black text-white leading-tight">{plan.title}</h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {plan.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 group-hover:text-purple-600 group-hover:translate-x-1 transition-all">
                                    Start Plan <ChevronRight size={16} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BiblePlans;
