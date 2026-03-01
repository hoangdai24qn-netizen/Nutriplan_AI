import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Activity, Target, MapPin, DollarSign, AlertCircle, Calendar } from 'lucide-react';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

export default function ProfileForm({ onSubmit, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    age: '25',
    gender: 'male',
    height: '170',
    weight: '65',
    activityLevel: 'medium',
    goal: 'maintain',
    allergies: '',
    budget: '100000',
    location: 'Hà Nội',
    planDuration: '7',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
      budget: Number(formData.budget),
      planDuration: Number(formData.planDuration) as 1 | 7,
    } as UserProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Thông tin cơ bản
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tuổi</label>
              <input 
                type="number" name="age" value={formData.age} onChange={handleChange} required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Giới tính</label>
              <select 
                name="gender" value={formData.gender} onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Chiều cao (cm)</label>
              <input 
                type="number" name="height" value={formData.height} onChange={handleChange} required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cân nặng (kg)</label>
              <input 
                type="number" name="weight" value={formData.weight} onChange={handleChange} required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Goals & Lifestyle */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Mục tiêu & Lối sống
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Mức độ vận động</label>
            <select 
              name="activityLevel" value={formData.activityLevel} onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="low">Ít vận động (Văn phòng)</option>
              <option value="medium">Trung bình (Tập thể dục 3-4 ngày/tuần)</option>
              <option value="high">Cao (Tập luyện nặng/Lao động chân tay)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Mục tiêu</label>
            <select 
              name="goal" value={formData.goal} onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="lose">Giảm cân</option>
              <option value="maintain">Giữ dáng</option>
              <option value="gain">Tăng cân</option>
              <option value="muscle">Tăng cơ</option>
            </select>
          </div>
        </div>

        {/* Budget & Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Ngân sách & Khu vực
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Ngân sách mỗi ngày (VNĐ)</label>
            <input 
              type="number" name="budget" value={formData.budget} onChange={handleChange} required step="10000"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Khu vực sinh sống
            </label>
            <input 
              type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Allergies & Plan Duration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-500" />
            Tùy chọn khác
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Các món dị ứng hoặc không ăn được</label>
            <textarea 
              name="allergies" value={formData.allergies} onChange={handleChange} placeholder="VD: Đậu phộng, hải sản, không ăn cay..." rows={2}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Thời gian lên thực đơn
            </label>
            <select 
              name="planDuration" value={formData.planDuration} onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="1">1 Ngày</option>
              <option value="7">7 Ngày (Cả tuần)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang phân tích...
            </>
          ) : (
            'Tạo Kế Hoạch Ăn Uống'
          )}
        </button>
      </div>
    </form>
  );
}
