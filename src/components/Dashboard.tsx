import React, { useState } from 'react';
import { AIResponse, Meal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Flame, Activity, DollarSign, Utensils, RefreshCw, ArrowRight, Info, Calendar as CalendarIcon, CheckCircle2, Sparkles } from 'lucide-react';

interface DashboardProps {
  data: AIResponse;
  onRegenerateMeal: (day: number, mealId: string) => void;
  onToggleMealComplete: (day: number, mealId: string) => void;
  isLoadingRegenerate?: boolean;
}

export default function Dashboard({ data, onRegenerateMeal, onToggleMealComplete, isLoadingRegenerate }: DashboardProps) {
  const { analysis, weeklyPlan } = data;
  const [selectedDay, setSelectedDay] = useState<number>(weeklyPlan[0]?.day || 1);

  const currentDayPlan = weeklyPlan.find(p => p.day === selectedDay) || weeklyPlan[0];

  const macroData = [
    { name: 'Protein', value: analysis.macros.protein, color: '#10b981' }, // Emerald 500
    { name: 'Carbs', value: analysis.macros.carbs, color: '#f59e0b' }, // Amber 500
    { name: 'Fat', value: analysis.macros.fat, color: '#ef4444' }, // Red 500
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (!currentDayPlan) return null;

  return (
    <div className="space-y-8">
      {/* AI Advice Section (if available) */}
      {analysis.progressAdvice && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Lời khuyên từ AI dựa trên tiến trình của bạn</h3>
            <p className="text-indigo-50 leading-relaxed">{analysis.progressAdvice}</p>
          </div>
        </div>
      )}

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TDEE & Calories Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Năng lượng mục tiêu</h3>
              <p className="text-3xl font-bold text-slate-800">{analysis.targetCalories} <span className="text-lg font-medium text-slate-500">kcal</span></p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 flex justify-between">
              <span>TDEE (Năng lượng tiêu hao):</span>
              <span className="font-medium">{analysis.tdee} kcal</span>
            </p>
          </div>
        </div>

        {/* Macros Chart Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}g`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Phân bổ dinh dưỡng
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
              {analysis.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Meal Plan Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-500" />
            Thực đơn {weeklyPlan.length > 1 ? 'trong tuần' : 'hôm nay'}
          </h2>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <div className="text-sm">
              <span className="text-slate-500">Tổng chi phí: </span>
              <span className={`font-bold ${currentDayPlan.totalPrice > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {formatCurrency(currentDayPlan.totalPrice)}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="text-sm">
              <span className="text-slate-500">Tổng Calo: </span>
              <span className="font-bold text-slate-800">{currentDayPlan.totalCalories}</span>
            </div>
          </div>
        </div>

        {weeklyPlan.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-2 mb-4 hide-scrollbar">
            {weeklyPlan.map(plan => (
              <button
                key={plan.day}
                onClick={() => setSelectedDay(plan.day)}
                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedDay === plan.day 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Ngày {plan.day}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentDayPlan.meals.map((meal) => (
            <div 
              key={meal.id} 
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-300 relative ${
                meal.completed 
                  ? 'border-emerald-200 bg-emerald-50/30 opacity-80' 
                  : 'border-slate-100 hover:shadow-md hover:-translate-y-1'
              }`}
            >
              {meal.completed && (
                <div className="absolute inset-0 bg-white/40 z-10 pointer-events-none" />
              )}
              
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start relative z-20">
                <div>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                    meal.completed ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {meal.type}
                  </span>
                  <h3 className={`text-lg font-bold leading-tight ${meal.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {meal.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onToggleMealComplete(currentDayPlan.day, meal.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      meal.completed 
                        ? 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200' 
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={meal.completed ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onRegenerateMeal(currentDayPlan.day, meal.id)}
                    disabled={isLoadingRegenerate || meal.completed}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Đổi món khác"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingRegenerate ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 flex-grow space-y-4 relative z-20">
                <div className={`grid grid-cols-4 gap-2 text-center text-xs ${meal.completed ? 'opacity-70' : ''}`}>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="font-bold text-slate-800">{meal.calories}</div>
                    <div className="text-slate-500">kcal</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <div className="font-bold text-emerald-700">{meal.protein}g</div>
                    <div className="text-emerald-600/70">Pro</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <div className="font-bold text-amber-700">{meal.carbs}g</div>
                    <div className="text-amber-600/70">Carb</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg">
                    <div className="font-bold text-red-700">{meal.fat}g</div>
                    <div className="text-red-600/70">Fat</div>
                  </div>
                </div>

                <div className={meal.completed ? 'opacity-70' : ''}>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">Nguyên liệu:</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{meal.ingredients.join(', ')}</p>
                </div>

                {meal.cheaperAlternative && (
                  <div className={`bg-blue-50 p-3 rounded-xl flex gap-2 items-start ${meal.completed ? 'opacity-70' : ''}`}>
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">Gợi ý tiết kiệm:</span> {meal.cheaperAlternative}
                    </p>
                  </div>
                )}
              </div>

              <div className={`p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center mt-auto relative z-20 ${meal.completed ? 'opacity-70' : ''}`}>
                <span className="text-sm font-medium text-slate-500">Ước tính:</span>
                <span className="text-lg font-bold text-slate-800">{formatCurrency(meal.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
