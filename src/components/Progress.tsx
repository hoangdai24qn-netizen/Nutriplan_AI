import React, { useState } from 'react';
import { WeightRecord, ExpenseRecord, HeightRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, Plus, Scale, Calendar, Ruler } from 'lucide-react';

interface ProgressProps {
  weightRecords: WeightRecord[];
  heightRecords: HeightRecord[];
  expenseRecords: ExpenseRecord[];
  onAddWeight: (weight: number, date: string) => void;
  onAddHeight: (height: number, date: string) => void;
  onAddExpense: (amount: number, note: string, date: string) => void;
}

export default function Progress({ weightRecords, heightRecords, expenseRecords, onAddWeight, onAddHeight, onAddExpense }: ProgressProps) {
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [newHeight, setNewHeight] = useState('');
  const [heightDate, setHeightDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [newExpense, setNewExpense] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight && weightDate) {
      onAddWeight(Number(newWeight), weightDate);
      setNewWeight('');
    }
  };

  const handleAddHeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHeight && heightDate) {
      onAddHeight(Number(newHeight), heightDate);
      setNewHeight('');
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense && expenseDate) {
      onAddExpense(Number(newExpense), expenseNote, expenseDate);
      setNewExpense('');
      setExpenseNote('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Calculate total expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenseRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  const totalMonthlyExpense = currentMonthExpenses.reduce((sum, record) => sum + record.amount, 0);

  // Combine weight and height records for the chart
  const combinedRecordsMap = new Map<string, any>();
  
  weightRecords.forEach(r => {
    combinedRecordsMap.set(r.date, { date: r.date, weight: r.weight });
  });
  
  heightRecords.forEach(r => {
    if (combinedRecordsMap.has(r.date)) {
      combinedRecordsMap.get(r.date).height = r.height;
    } else {
      combinedRecordsMap.set(r.date, { date: r.date, height: r.height });
    }
  });

  const sortedCombinedRecords = Array.from(combinedRecordsMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tiến trình của bạn</h2>
          <p className="text-slate-500">Theo dõi thể trạng và chi tiêu hàng tháng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Tracking */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              Theo dõi thể trạng
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleAddWeight} className="flex flex-col gap-2">
              <label className="block text-xs font-medium text-slate-500">Cân nặng (kg)</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={weightDate} 
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
                <input 
                  type="number" 
                  step="0.1"
                  value={newWeight} 
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="VD: 65.5"
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Thêm cân nặng
              </button>
            </form>

            <form onSubmit={handleAddHeight} className="flex flex-col gap-2">
              <label className="block text-xs font-medium text-slate-500">Chiều cao (cm)</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={heightDate} 
                  onChange={(e) => setHeightDate(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                />
                <input 
                  type="number" 
                  step="0.1"
                  value={newHeight} 
                  onChange={(e) => setNewHeight(e.target.value)}
                  placeholder="VD: 170"
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Thêm chiều cao
              </button>
            </form>
          </div>

          <div className="h-64 w-full mt-4">
            {sortedCombinedRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedCombinedRecords} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => {
                      const d = new Date(tick);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="weight" 
                    name="Cân nặng (kg)"
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="height" 
                    name="Chiều cao (cm)"
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Chưa có dữ liệu thể trạng. Hãy thêm bản ghi đầu tiên!
              </div>
            )}
          </div>
        </div>

        {/* Expense Tracking */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Chi tiêu ăn uống
            </h3>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tháng này</div>
              <div className="text-xl font-bold text-emerald-600">{formatCurrency(totalMonthlyExpense)}</div>
            </div>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Ngày</label>
                <input 
                  type="date" 
                  value={expenseDate} 
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Số tiền (VNĐ)</label>
                <input 
                  type="number" 
                  step="1000"
                  value={newExpense} 
                  onChange={(e) => setNewExpense(e.target.value)}
                  placeholder="VD: 50000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Ghi chú (Món ăn)</label>
                <input 
                  type="text" 
                  value={expenseNote} 
                  onChange={(e) => setExpenseNote(e.target.value)}
                  placeholder="VD: Phở bò"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1 text-sm font-medium h-[38px]"
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
          </form>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Lịch sử chi tiêu tháng này
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {currentMonthExpenses.length > 0 ? (
                currentMonthExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{record.note}</div>
                      <div className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className="font-bold text-slate-700 text-sm">
                      {formatCurrency(record.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Chưa có chi tiêu nào trong tháng này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
