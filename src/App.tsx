import React, { useState, useEffect } from 'react';
import { Leaf, LayoutDashboard, LineChart, LogOut, User as UserIcon, Camera } from 'lucide-react';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import Progress from './components/Progress';
import Auth from './components/Auth';
import ImageAnalyzer from './components/ImageAnalyzer';
import { UserProfile, AIResponse, WeightRecord, HeightRecord, ExpenseRecord, User } from './types';
import { generateMealPlan, regenerateSingleMeal } from './services/ai';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'progress' | 'analyze'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [data, setData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progress State
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [heightRecords, setHeightRecords] = useState<HeightRecord[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nutriplan_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Load user data when user changes
  useEffect(() => {
    if (currentUser) {
      const savedWeights = localStorage.getItem(`nutriplan_weights_${currentUser.id}`);
      const savedHeights = localStorage.getItem(`nutriplan_heights_${currentUser.id}`);
      const savedExpenses = localStorage.getItem(`nutriplan_expenses_${currentUser.id}`);
      const savedProfile = localStorage.getItem(`nutriplan_profile_${currentUser.id}`);
      const savedData = localStorage.getItem(`nutriplan_data_${currentUser.id}`);

      if (savedWeights) setWeightRecords(JSON.parse(savedWeights));
      else setWeightRecords([]);

      if (savedHeights) setHeightRecords(JSON.parse(savedHeights));
      else setHeightRecords([]);

      if (savedExpenses) setExpenseRecords(JSON.parse(savedExpenses));
      else setExpenseRecords([]);

      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedData) setData(JSON.parse(savedData));
    }
  }, [currentUser]);

  // Save to localStorage when changed
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`nutriplan_weights_${currentUser.id}`, JSON.stringify(weightRecords));
    }
  }, [weightRecords, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`nutriplan_heights_${currentUser.id}`, JSON.stringify(heightRecords));
    }
  }, [heightRecords, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`nutriplan_expenses_${currentUser.id}`, JSON.stringify(expenseRecords));
    }
  }, [expenseRecords, currentUser]);

  useEffect(() => {
    if (currentUser && profile) {
      localStorage.setItem(`nutriplan_profile_${currentUser.id}`, JSON.stringify(profile));
    }
  }, [profile, currentUser]);

  useEffect(() => {
    if (currentUser && data) {
      localStorage.setItem(`nutriplan_data_${currentUser.id}`, JSON.stringify(data));
    }
  }, [data, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('nutriplan_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfile(null);
    setData(null);
    setWeightRecords([]);
    setHeightRecords([]);
    setExpenseRecords([]);
    setCurrentView('home');
    localStorage.removeItem('nutriplan_current_user');
  };

  const handleProfileSubmit = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMealPlan(newProfile, weightRecords, heightRecords);
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateMeal = async (day: number, mealId: string) => {
    if (!profile || !data) return;
    
    const dayPlan = data.weeklyPlan.find(p => p.day === day);
    if (!dayPlan) return;

    const currentMeal = dayPlan.meals.find(m => m.id === mealId);
    if (!currentMeal) return;

    setIsRegenerating(true);
    try {
      const newMeal = await regenerateSingleMeal(profile, currentMeal, dayPlan.meals);
      
      setData(prev => {
        if (!prev) return prev;
        
        const updatedWeeklyPlan = prev.weeklyPlan.map(plan => {
          if (plan.day === day) {
            const updatedMeals = plan.meals.map(m => m.id === mealId ? newMeal : m);
            const newTotalCalories = updatedMeals.reduce((sum, m) => sum + m.calories, 0);
            const newTotalPrice = updatedMeals.reduce((sum, m) => sum + m.price, 0);
            return {
              ...plan,
              meals: updatedMeals,
              totalCalories: newTotalCalories,
              totalPrice: newTotalPrice
            };
          }
          return plan;
        });

        return {
          ...prev,
          weeklyPlan: updatedWeeklyPlan
        };
      });
    } catch (err) {
      console.error(err);
      alert('Không thể đổi món lúc này. Vui lòng thử lại.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleMealComplete = (day: number, mealId: string) => {
    setData(prev => {
      if (!prev) return prev;
      
      const updatedWeeklyPlan = prev.weeklyPlan.map(plan => {
        if (plan.day === day) {
          const updatedMeals = plan.meals.map(m => 
            m.id === mealId ? { ...m, completed: !m.completed } : m
          );
          return { ...plan, meals: updatedMeals };
        }
        return plan;
      });

      return {
        ...prev,
        weeklyPlan: updatedWeeklyPlan
      };
    });
  };

  const handleAddWeight = (weight: number, date: string) => {
    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      weight,
      date
    };
    setWeightRecords(prev => [...prev, newRecord]);
  };

  const handleAddHeight = (height: number, date: string) => {
    const newRecord: HeightRecord = {
      id: Date.now().toString(),
      height,
      date
    };
    setHeightRecords(prev => [...prev, newRecord]);
  };

  const handleAddExpense = (amount: number, note: string, date: string) => {
    const newRecord: ExpenseRecord = {
      id: Date.now().toString(),
      amount,
      note,
      date
    };
    setExpenseRecords(prev => [...prev, newRecord]);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:inline-block">NutriPlan <span className="text-emerald-600">AI</span></span>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                currentView === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline-block">Kế hoạch</span>
            </button>
            <button 
              onClick={() => setCurrentView('progress')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                currentView === 'progress' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span className="hidden sm:inline-block">Tiến trình</span>
            </button>
            <button 
              onClick={() => setCurrentView('analyze')}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                currentView === 'analyze' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline-block">Phân tích</span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <UserIcon className="w-4 h-4" />
                </div>
                {currentUser.name}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {currentView === 'home' ? (
          <>
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Kế hoạch dinh dưỡng <span className="text-emerald-600">cá nhân hóa</span>
              </h1>
              <p className="text-lg text-slate-600">
                AI sẽ giúp bạn tính toán lượng calo, phân bổ dinh dưỡng và lên thực đơn phù hợp với ngân sách và thể trạng của riêng bạn.
              </p>
            </div>

            {error && (
              <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            {!data ? (
              <div className="max-w-3xl mx-auto">
                <ProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => {
                      setData(null);
                      setProfile(null);
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Sửa thông tin cá nhân
                  </button>
                </div>
                <Dashboard 
                  data={data} 
                  onRegenerateMeal={handleRegenerateMeal} 
                  onToggleMealComplete={handleToggleMealComplete}
                  isLoadingRegenerate={isRegenerating}
                />
              </div>
            )}
          </>
        ) : currentView === 'progress' ? (
          <Progress 
            weightRecords={weightRecords}
            heightRecords={heightRecords}
            expenseRecords={expenseRecords}
            onAddWeight={handleAddWeight}
            onAddHeight={handleAddHeight}
            onAddExpense={handleAddExpense}
          />
        ) : (
          <ImageAnalyzer />
        )}
      </main>
    </div>
  );
}
