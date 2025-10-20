// API Configuration
export const API_CONFIG = {
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  SCRIPTURE_API_KEY: import.meta.env.VITE_SCRIPTURE_API_KEY,
  
  // DeepSeek Free Model Only
  DEEPSEEK_MODELS: [
    'deepseek/deepseek-chat-v3.1:free'
  ]
};

// API Headers
export const getOpenRouterHeaders = () => ({
  'Authorization': `Bearer ${API_CONFIG.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
});

// Test DeepSeek API
export const testDeepSeekAPI = async () => {
  try {
    const response = await fetch(`${API_CONFIG.OPENROUTER_BASE_URL}/models`, {
      headers: getOpenRouterHeaders()
    });
    
    if (response.ok) {
      const data = await response.json();
      const deepseekModels = data.data?.filter(model => 
        model.id.includes('deepseek') || model.name?.toLowerCase().includes('deepseek')
      ) || [];
      
      return {
        success: true,
        deepseekModels: deepseekModels,
        availableDeepSeek: deepseekModels.map(m => m.id)
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${await response.text()}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
