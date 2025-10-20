# AI Generation Setup Guide

## OpenRouter API Configuration

To enable AI generation for daily verses and confessions, you need to set up an OpenRouter API key.

### 1. Get OpenRouter API Key

1. Go to [OpenRouter Platform](https://openrouter.ai/keys)
2. Sign up or log in to your account
3. Click "Create Key"
4. Copy the generated API key

### 2. Set Environment Variable

Create a `.env` file in your project root with:

```env
# For Vite (recommended)
VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here

# Or for Create React App
REACT_APP_OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm start
```

## Features

### Daily Content Generation
- **AI Verse**: Generates relevant Bible verses for today using FREE AI models
- **AI Confession**: Creates confessions that relate to the verse theme
- **Fallback Content**: Uses predefined content if AI is unavailable

### Topic Content Generation
- **Topic Verses**: Generates 3 verses specific to a topic
- **Topic Confessions**: Generates 3 confessions for a topic
- **Automatic Integration**: Content is automatically saved to the database

### Free AI Models Available (Ranked by Performance)
- **🥇 Mixtral 8x7B**: BEST FREE - Outperforms GPT-3.5, 6x faster than similar models
- **🥈 Meta Llama 3.1**: EXCELLENT - Strong reasoning, 128K context window
- **🥉 DeepSeek Chat**: VERY GOOD - Strong reasoning capabilities, 128K context
- **Google Gemini Flash**: GOOD - 1M token context, multimodal support
- **Microsoft Phi-3 Mini**: GOOD - Fast and efficient for spiritual content
- **Meta Llama 3.2**: GOOD - High-quality text generation
- **Google Gemma 2**: GOOD - Lightweight and capable
- **Alibaba Qwen 2.5**: GOOD - Multilingual support

## Usage

1. **Go to Admin Dashboard** → "AI Generation" tab
2. **Check AI Status** → Ensure connection is successful
3. **Generate Daily Content** → Click "Generate Daily Content" button
4. **Generate Topic Content** → Select a topic and click "Generate Topic Content"

## Fallback System

If AI generation fails, the system will:
1. Log the error
2. Use predefined fallback content
3. Continue normal operation
4. Show appropriate error messages

## Cost Considerations

- **🎉 COMPLETELY FREE!** Using free AI models from OpenRouter
- No cost for AI content generation
- Free models provide excellent quality for spiritual content
- No usage limits or billing concerns

## Troubleshooting

### Common Issues

1. **"AI Disconnected" Status**
   - Check if API key is set correctly
   - Verify API key is valid and has credits
   - Check network connection

2. **Generation Fails**
   - Check OpenRouter API status
   - Verify API key permissions
   - Check console for error messages

3. **Fallback Content Used**
   - This is normal when AI is unavailable
   - Check API key configuration
   - Verify OpenRouter account status

### Support

- Check OpenRouter documentation: https://openrouter.ai/docs
- Monitor API usage: https://openrouter.ai/activity
- Contact OpenRouter support for API issues
