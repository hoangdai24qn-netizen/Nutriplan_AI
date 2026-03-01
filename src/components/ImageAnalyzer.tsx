import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Info, AlertCircle, Sparkles } from 'lucide-react';
import { analyzeMealImage } from '../services/ai';
import { ImageAnalysisResult } from '../types';

export default function ImageAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh hợp lệ.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract base64 data and mime type
      const match = selectedImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) {
        throw new Error('Định dạng hình ảnh không hợp lệ.');
      }
      
      const mimeType = match[1];
      const base64Data = match[2];

      const analysisResult = await analyzeMealImage(base64Data, mimeType);
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi phân tích hình ảnh. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = (capture?: boolean) => {
    if (fileInputRef.current) {
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Phân tích món ăn bằng AI</h2>
        <p className="text-slate-600">
          Chụp ảnh hoặc tải lên hình ảnh món ăn của bạn để AI ước tính lượng calo và thành phần dinh dưỡng.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />

        {!selectedImage ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => triggerFileInput(true)}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              >
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Chụp ảnh</span>
              </button>
              
              <button 
                onClick={() => triggerFileInput(false)}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Tải ảnh lên</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              Hỗ trợ định dạng JPG, PNG. Kích thước tối đa 5MB.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video md:aspect-[21/9] flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Selected meal" 
                className="max-w-full max-h-full object-contain"
              />
              {!isAnalyzing && !result && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => triggerFileInput()}
                      className="px-4 py-2 bg-white text-slate-800 rounded-xl font-medium text-sm hover:bg-slate-100 transition-colors"
                    >
                      Đổi ảnh khác
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!result && (
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Phân tích món ăn
                    </>
                  )}
                </button>
              </div>
            )}

            {result && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{result.name}</h3>
                    <p className="text-slate-500 text-sm">Kết quả phân tích từ AI</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                    className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    Phân tích ảnh khác
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-800">{result.calories}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase mt-1">Kcal</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{result.protein}g</div>
                    <div className="text-xs font-medium text-emerald-600/70 uppercase mt-1">Protein</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-amber-600">{result.carbs}g</div>
                    <div className="text-xs font-medium text-amber-600/70 uppercase mt-1">Carbs</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-red-600">{result.fat}g</div>
                    <div className="text-xs font-medium text-red-600/70 uppercase mt-1">Fat</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Thành phần nhận diện được:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.ingredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
