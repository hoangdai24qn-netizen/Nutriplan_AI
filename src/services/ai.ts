import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, AIResponse, Meal, WeightRecord, HeightRecord, ImageAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMealPlan(
  profile: UserProfile, 
  weightHistory: WeightRecord[] = [], 
  heightHistory: HeightRecord[] = []
): Promise<AIResponse> {
  const model = 'gemini-3-flash-preview';
  
  const progressContext = weightHistory.length > 0 || heightHistory.length > 0 
    ? `
Lịch sử cân nặng của người dùng: ${JSON.stringify(weightHistory.slice(-5))}
Lịch sử chiều cao của người dùng: ${JSON.stringify(heightHistory.slice(-5))}
Dựa vào lịch sử này và mục tiêu hiện tại, hãy đưa ra một lời khuyên ngắn gọn (progressAdvice) về tiến trình của họ.
` : '';

  const prompt = `
Bạn là một chuyên gia dinh dưỡng hàng đầu. Hãy lập kế hoạch ăn uống cá nhân hóa cho người dùng sau:
- Tuổi: ${profile.age}
- Giới tính: ${profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'}
- Chiều cao: ${profile.height} cm
- Cân nặng: ${profile.weight} kg
- Mức độ vận động: ${profile.activityLevel === 'low' ? 'Ít' : profile.activityLevel === 'medium' ? 'Trung bình' : 'Cao'}
- Mục tiêu: ${profile.goal === 'lose' ? 'Giảm cân' : profile.goal === 'maintain' ? 'Giữ dáng' : profile.goal === 'gain' ? 'Tăng cân' : 'Tăng cơ'}
- Dị ứng thực phẩm: ${profile.allergies || 'Không có'}
- Ngân sách mỗi ngày: ${profile.budget} VNĐ
- Khu vực sinh sống: ${profile.location} (Gợi ý thực phẩm phổ biến, dễ tìm, giá rẻ tại đây)

${progressContext}

Yêu cầu:
1. Tính TDEE và lượng calo mục tiêu mỗi ngày.
2. Phân bổ Macros (Protein, Carbs, Fat) hợp lý theo mục tiêu.
3. Cung cấp một lời giải thích ngắn gọn, dễ hiểu về các chỉ số này.
4. Lên thực đơn cho ${profile.planDuration} ngày (Mỗi ngày 3-5 bữa: Sáng, Trưa, Tối, Ăn vặt). ${profile.planDuration === 7 ? 'Các ngày nên có sự đa dạng món ăn.' : ''}
5. Các món ăn phải là món ăn phổ biến tại Việt Nam, tối ưu chi phí để TỔNG CHI PHÍ MỖI NGÀY KHÔNG VƯỢT QUÁ ngân sách ${profile.budget} VNĐ.
6. Ước tính giá tiền cho từng món ăn.
7. Gợi ý một lựa chọn thay thế rẻ hơn cho mỗi món (nếu có thể) nhưng vẫn đảm bảo dinh dưỡng.

Trả về kết quả dưới dạng JSON theo schema được cung cấp.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.OBJECT,
        properties: {
          tdee: { type: Type.NUMBER, description: "Total Daily Energy Expenditure in kcal" },
          targetCalories: { type: Type.NUMBER, description: "Target daily calories based on goal" },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER, description: "Protein in grams" },
              carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
              fat: { type: Type.NUMBER, description: "Fat in grams" }
            },
            required: ["protein", "carbs", "fat"]
          },
          explanation: { type: Type.STRING, description: "Short explanation of the calculation and macro split in Vietnamese" },
          progressAdvice: { type: Type.STRING, description: "Short advice based on weight/height history and current goal in Vietnamese. Leave empty if no history." }
        },
        required: ["tdee", "targetCalories", "macros", "explanation"]
      },
      weeklyPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER, description: "Day number (1 to 7)" },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique ID for the meal" },
                  type: { type: Type.STRING, description: "Breakfast, Lunch, Dinner, or Snack" },
                  name: { type: Type.STRING, description: "Name of the dish in Vietnamese" },
                  calories: { type: Type.NUMBER, description: "Calories for this meal" },
                  protein: { type: Type.NUMBER, description: "Protein in grams" },
                  carbs: { type: Type.NUMBER, description: "Carbs in grams" },
                  fat: { type: Type.NUMBER, description: "Fat in grams" },
                  price: { type: Type.NUMBER, description: "Estimated price in VND" },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of ingredients with quantities in Vietnamese"
                  },
                  recipe: { type: Type.STRING, description: "Short recipe or preparation instructions in Vietnamese" },
                  cheaperAlternative: { type: Type.STRING, description: "A cheaper alternative ingredient or dish in Vietnamese (optional)" }
                },
                required: ["id", "type", "name", "calories", "protein", "carbs", "fat", "price", "ingredients", "recipe"]
              }
            },
            totalCalories: { type: Type.NUMBER, description: "Total calories for the day" },
            totalPrice: { type: Type.NUMBER, description: "Total price for the day in VND" }
          },
          required: ["day", "meals", "totalCalories", "totalPrice"]
        }
      }
    },
    required: ["analysis", "weeklyPlan"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.7,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AIResponse;
}

export async function regenerateSingleMeal(
  profile: UserProfile,
  currentMeal: Meal,
  otherMealsInDay: Meal[]
): Promise<Meal> {
  const model = 'gemini-3-flash-preview';
  
  const otherMealsSummary = otherMealsInDay
    .filter(m => m.id !== currentMeal.id)
    .map(m => `- ${m.type}: ${m.name} (${m.calories} kcal, ${m.price} VNĐ)`)
    .join('\n');

  const prompt = `
Bạn là một chuyên gia dinh dưỡng. Người dùng muốn đổi món ăn sau trong thực đơn của họ:
- Món hiện tại: ${currentMeal.name} (${currentMeal.type})
- Lượng calo hiện tại: ${currentMeal.calories} kcal
- Giá hiện tại: ${currentMeal.price} VNĐ

Các món khác trong cùng ngày:
${otherMealsSummary}

Thông tin người dùng:
- Mục tiêu: ${profile.goal === 'lose' ? 'Giảm cân' : profile.goal === 'maintain' ? 'Giữ dáng' : profile.goal === 'gain' ? 'Tăng cân' : 'Tăng cơ'}
- Dị ứng: ${profile.allergies || 'Không'}
- Khu vực: ${profile.location}

Hãy gợi ý MỘT món ăn MỚI hoàn toàn khác để thay thế cho bữa ${currentMeal.type}.
Món mới nên có lượng calo và giá tiền tương đương món cũ để không làm hỏng kế hoạch trong ngày.
Đảm bảo món ăn phù hợp với văn hóa ẩm thực Việt Nam.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "Unique ID for the meal" },
      type: { type: Type.STRING, description: "Breakfast, Lunch, Dinner, or Snack" },
      name: { type: Type.STRING, description: "Name of the dish in Vietnamese" },
      calories: { type: Type.NUMBER, description: "Calories for this meal" },
      protein: { type: Type.NUMBER, description: "Protein in grams" },
      carbs: { type: Type.NUMBER, description: "Carbs in grams" },
      fat: { type: Type.NUMBER, description: "Fat in grams" },
      price: { type: Type.NUMBER, description: "Estimated price in VND" },
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of ingredients with quantities in Vietnamese"
      },
      recipe: { type: Type.STRING, description: "Short recipe or preparation instructions in Vietnamese" },
      cheaperAlternative: { type: Type.STRING, description: "A cheaper alternative ingredient or dish in Vietnamese (optional)" }
    },
    required: ["id", "type", "name", "calories", "protein", "carbs", "fat", "price", "ingredients", "recipe"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.8,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  const newMeal = JSON.parse(text) as Meal;
  // Ensure the type remains the same
  newMeal.type = currentMeal.type;
  return newMeal;
}

export async function analyzeMealImage(base64Image: string, mimeType: string): Promise<ImageAnalysisResult> {
  const model = 'gemini-3-flash-preview'; // Vision is supported in flash preview
  
  const prompt = `
Bạn là một chuyên gia dinh dưỡng và phân tích thực phẩm.
Hãy phân tích hình ảnh món ăn này và ước tính các thông tin dinh dưỡng.
Nếu trong ảnh có nhiều món, hãy tính tổng hoặc liệt kê món chính.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Tên món ăn dự đoán (Tiếng Việt)" },
      calories: { type: Type.NUMBER, description: "Ước tính tổng lượng calo (kcal)" },
      protein: { type: Type.NUMBER, description: "Ước tính lượng Protein (g)" },
      carbs: { type: Type.NUMBER, description: "Ước tính lượng Carbohydrate (g)" },
      fat: { type: Type.NUMBER, description: "Ước tính lượng Chất béo (g)" },
      ingredients: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Danh sách các nguyên liệu chính có thể nhìn thấy"
      },
      explanation: { type: Type.STRING, description: "Giải thích ngắn gọn về đánh giá dinh dưỡng của món ăn này" }
    },
    required: ["name", "calories", "protein", "carbs", "fat", "ingredients", "explanation"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.4,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ImageAnalysisResult;
}
