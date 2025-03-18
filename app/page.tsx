"use client";

import React, { useState } from 'react';
import { analyzeFoodImage } from '@/app/api/analyze';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Upload, FileImage, Utensils, BrainCircuit, AlertTriangle, 
  Check, Clock, X, Camera, Info, Apple, Carrot, 
  Salad, Beef, Fish, Egg, Dessert, Activity, 
  Heart, Brain, Leaf, ShieldCheck
} from 'lucide-react';

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

const FoodAnalysisApp: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset analysis
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyzeFoodImage(selectedFile);
      setAnalysisResult(result);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for the nutrition chart
  const prepareNutritionData = () => {
    if (!analysisResult) return [];
    
    const { nutritionalInfo } = analysisResult;
    return [
      { name: 'Carbs', value: nutritionalInfo.carbohydrates, fill: '#4CAF50' },
      { name: 'Protein', value: nutritionalInfo.protein, fill: '#2E7D32' },
      { name: 'Total Fat', value: nutritionalInfo.fats.total, fill: '#81C784' },
      { name: 'Fiber', value: nutritionalInfo.fiber, fill: '#A5D6A7' },
      { name: 'Sugar', value: nutritionalInfo.sugar, fill: '#C8E6C9' }
    ];
  };

  // Prepare data for the fats breakdown chart
  const prepareFatsData = () => {
    if (!analysisResult) return [];
    
    const { fats } = analysisResult.nutritionalInfo;
    return [
      { name: 'Saturated', value: fats.saturated, fill: '#FFA726' },
      { name: 'Unsaturated', value: fats.unsaturated, fill: '#66BB6A' },
      { name: 'Trans', value: fats.trans, fill: '#EF5350' }
    ];
  };

  // Food categories with icons for the gallery
  const foodCategories = [
    { name: "Fruits", icon: <Apple size={24} className="text-green-700" /> },
    { name: "Vegetables", icon: <Carrot size={24} className="text-green-700" /> },
    { name: "Proteins", icon: <Egg size={24} className="text-green-700" /> },
    { name: "Grains", icon: <Utensils size={24} className="text-green-700" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-2 bg-green-800 bg-opacity-10 rounded-full mb-6">
            <Utensils size={48} className="text-green-700" />
          </div>
          <h1 className="text-5xl font-bold text-green-800 mb-3">EatAlyzer</h1>
          <p className="text-lg text-green-700 max-w-2xl mx-auto">
            Advanced food analysis that provides detailed nutritional information and personalized health insights from your meal photos
          </p>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Food icons banner */}
          <div className="bg-green-700 p-4 flex justify-between items-center">
            {foodCategories.map((category, index) => (
              <div key={index} className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center">
                {category.icon}
              </div>
            ))}
          </div>
          
          {/* Upload section */}
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Camera className="mr-3" size={28} />
                  Analyze Your Meal
                </h2>
                <p className="mb-6 opacity-90 text-lg">
                  Take a photo of your meal to get instant nutritional insights and personalized health recommendations.
                </p>
                
                <div className="flex flex-col gap-4 max-w-md">
                  <label className="flex items-center justify-center w-full h-14 px-4 transition bg-white bg-opacity-20 border-2 border-white border-dashed rounded-lg appearance-none cursor-pointer hover:bg-opacity-30 focus:outline-none">
                    <span className="flex items-center">
                      <FileImage className="mr-2" size={22} />
                      {selectedFile ? selectedFile.name : 'Select a food image'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isLoading}
                    className="flex items-center justify-center w-full h-14 px-6 text-green-800 bg-white rounded-lg shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="mr-2 animate-spin" size={22} />
                        Analyzing your meal...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="mr-2" size={22} />
                        Get Nutritional Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Image preview */}
              <div className="w-full md:w-80 h-80 rounded-xl overflow-hidden bg-black bg-opacity-10 flex items-center justify-center border-2 border-white border-opacity-30 shadow-lg">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 flex flex-col items-center">
                    <Camera size={64} className="mb-4 text-white opacity-60" />
                    <p className="text-lg opacity-90">Your meal image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* How It Works Section (when no analysis is available) */}
          {!analysisResult && !isLoading && (
            <div className="p-8 bg-green-50">
              <div className="flex items-center space-x-2 mb-4">
                <Info size={20} className="text-green-700" />
                <h3 className="text-lg font-medium text-green-800">How it works</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <Camera size={24} className="text-green-700" />
                  </div>
                  <h4 className="font-medium text-green-800 mb-2">Upload Photo</h4>
                  <p className="text-gray-600">Take a clear photo of your meal or snack</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <BrainCircuit size={24} className="text-green-700" />
                  </div>
                  <h4 className="font-medium text-green-800 mb-2">AI Analysis</h4>
                  <p className="text-gray-600">Our AI identifies ingredients and analyzes nutrition</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <Check size={24} className="text-green-700" />
                  </div>
                  <h4 className="font-medium text-green-800 mb-2">Get Insights</h4>
                  <p className="text-gray-600">Receive nutritional data and personalized recommendations</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-4">Popular Food Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg overflow-hidden shadow-sm bg-green-50 border border-green-100">
                    <div className="bg-green-700 h-32 flex items-center justify-center">
                      <Salad size={64} className="text-white" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-green-800 text-sm">Fresh Salads</h4>
                      <p className="text-xs text-gray-600">Low calorie, high nutrients</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden shadow-sm bg-green-50 border border-green-100">
                    <div className="bg-green-700 h-32 flex items-center justify-center">
                      <Beef size={64} className="text-white" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-green-800 text-sm">Protein Rich</h4>
                      <p className="text-xs text-gray-600">Excellent for muscle growth</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden shadow-sm bg-green-50 border border-green-100">
                    <div className="bg-green-700 h-32 flex items-center justify-center">
                      <Fish size={64} className="text-white" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-green-800 text-sm">Omega-3 Foods</h4>
                      <p className="text-xs text-gray-600">Great for heart health</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden shadow-sm bg-green-50 border border-green-100">
                    <div className="bg-green-700 h-32 flex items-center justify-center">
                      <Dessert size={64} className="text-white" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-green-800 text-sm">Sweet Treats</h4>
                      <p className="text-xs text-gray-600">Moderation is key</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Results section */}
          {analysisResult && (
            <div className="p-8 bg-green-50">
              <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                <Check className="mr-2" size={24} />
                Analysis Results
              </h2>
              
              {/* Calories & Health Assessment */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Calories */}
                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-4">Calorie Estimate</h3>
                  <div className="flex items-end">
                    <span className="text-5xl font-bold text-green-600">{analysisResult.calories}</span>
                    <span className="ml-2 text-green-700 mb-1">calories</span>
                  </div>
                  <p className="text-gray-600 mt-4">Based on identified ingredients and portion size</p>
                </div>
                
                {/* Health Assessment */}
                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-4">Health Assessment</h3>
                  <div className="flex items-center">
                    {analysisResult.healthAssessment.isHealthy ? (
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <Check className="text-green-600" size={24} />
                      </div>
                    ) : (
                      <div className="bg-amber-100 p-2 rounded-full mr-3">
                        <AlertTriangle className="text-amber-600" size={24} />
                      </div>
                    )}
                    <span className={`text-lg font-medium ${analysisResult.healthAssessment.isHealthy ? 'text-green-600' : 'text-amber-600'}`}>
                      {analysisResult.healthAssessment.isHealthy ? 'Healthy Choice' : 'Nutrition Alert'}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-4 border-l-4 border-green-200 pl-4 py-1">
                    {analysisResult.healthAssessment.recommendedConsumption}
                  </p>
                </div>
              </div>
              
              {/* Content & Nutrition Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Contents */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-4">Detected Ingredients</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysisResult.contents.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center items-center">
                    <div className="grid grid-cols-3 gap-4">
                      {analysisResult.contents.slice(0, 6).map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          {index % 6 === 0 ? <Apple size={32} className="text-green-600" /> :
                           index % 6 === 1 ? <Carrot size={32} className="text-green-600" /> :
                           index % 6 === 2 ? <Egg size={32} className="text-green-600" /> :
                           index % 6 === 3 ? <Beef size={32} className="text-green-600" /> :
                           index % 6 === 4 ? <Fish size={32} className="text-green-600" /> :
                           <Leaf size={32} className="text-green-600" />}
                          <span className="text-xs mt-1 text-green-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Nutrition Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Nutritional Breakdown</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareNutritionData()} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Fats & Health Benefits */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fats Breakdown */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Fats Breakdown</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareFatsData()}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Health Benefits & Warnings */}
                <div className="grid grid-rows-2 gap-4">
                  {/* Benefits */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-full mr-2">
                        <Check className="text-green-600" size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-green-800">Health Benefits</h3>
                    </div>
                    <div className="flex">
                      <div className="flex-1">
                        <ul className="space-y-2">
                          {analysisResult.healthAssessment.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex-shrink-0 ml-4 hidden md:block">
                        <Heart size={64} className="text-green-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Warnings */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-amber-100 p-2 rounded-full mr-2">
                        <AlertTriangle className="text-amber-600" size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-green-800">Health Considerations</h3>
                    </div>
                    <div className="flex">
                      <div className="flex-1">
                        {analysisResult.healthAssessment.warnings.length > 0 ? (
                          <ul className="space-y-2">
                            {analysisResult.healthAssessment.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start">
                                <AlertTriangle className="text-amber-500 mr-2 flex-shrink-0 mt-1" size={16} />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-600">No specific warnings for this food.</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-4 hidden md:block">
                        <ShieldCheck size={64} className="text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Insights */}
              <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-4">Personalized Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-700 mb-2">Complementary Foods</h4>
                    <div className="flex items-center">
                      <Leaf size={36} className="text-green-600 mr-3" />
                      <p className="text-sm text-gray-700">Consider pairing with leafy greens for added nutrients</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-700 mb-2">Dietary Context</h4>
                    <div className="flex items-center">
                      <Brain size={36} className="text-green-600 mr-3" />
                      <p className="text-sm text-gray-700">This meal fits well in a balanced Mediterranean diet</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-700 mb-2">Portion Advice</h4>
                    <div className="flex items-center">
                      <Activity size={36} className="text-green-600 mr-3" />
                      <p className="text-sm text-gray-700">Standard portion provides 30% of daily recommended protein</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Professional footer */}
          <div className="bg-green-800 text-white py-8 px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-medium mb-4 flex items-center">
                  <Utensils className="mr-2" size={20} />
                  EatAlyzer
                </h4>
                <p className="text-green-100 text-sm">
                  Advanced food analysis powered by artificial intelligence. Get detailed nutritional insights from your food photos in seconds.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4">Important Note</h4>
                <p className="text-green-100 text-sm">
                  Analysis is an estimate based on visual identification. Results may vary. Not a substitute for professional dietary or medical advice.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4">About</h4>
                <p className="text-green-100 text-sm">
                  Powered by advanced computer vision and nutritional database. We're committed to helping you make informed dietary choices.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-green-700 text-center text-green-200 text-sm">
              © {new Date().getFullYear()} EatAlyzer • All analysis is provided for informational purposes only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysisApp;