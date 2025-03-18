import axios from 'axios';

// Define the response type for better TypeScript support
interface FoodAnalysisResponse {
  calories: number;
  contents: string[];
  nutritionalInfo: {
    fats: {
      total: number;
      saturated: number;
      unsaturated: number;
      trans: number;
    };
    protein: number;
    carbohydrates: number;
    sugar: number;
    fiber: number;
  };
  healthAssessment: {
    isHealthy: boolean;
    recommendedConsumption: string;
    warnings: string[];
    benefits: string[];
  };
}

/**
 * Analyzes food image and returns nutritional information
 * @param imageFile - The image file to analyze
 * @returns Promise containing the analysis results
 */
export async function analyzeFoodImage(imageFile: File): Promise<FoodAnalysisResponse> {
  try {
    // Convert the image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Prepare the request to Groq
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.2-90b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and provide nutritional information. 
                Please respond ONLY with a JSON object containing the following fields:
                - calories: numeric value of estimated calories
                - contents: array of ingredients or food items detected
                - nutritionalInfo: object containing detailed nutritional values including fats (total, saturated, unsaturated, trans), protein, carbohydrates, sugar, and fiber
                - healthAssessment: object with boolean isHealthy, recommendedConsumption advice, warnings array, and benefits array
                
                Return ONLY the JSON object with no additional text.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the JSON content from the response
    const jsonContent = JSON.parse(response.data.choices[0].message.content);
    return jsonContent as FoodAnalysisResponse;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw new Error('Failed to analyze food image');
  }
}

/**
 * Converts a File object to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => reject(error);
  });
}