require('dotenv').config({ path: '.env.local' });

async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No OPENAI_API_KEY found in environment');
    return;
  }
  
  console.log(`🔑 API Key format: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const gpt4Models = data.data.filter(model => model.id.includes('gpt-4'));
      console.log('✅ API Key is valid!');
      console.log(`📊 Available GPT-4 models: ${gpt4Models.length}`);
      console.log(`🤖 GPT-4o available: ${gpt4Models.some(m => m.id === 'gpt-4o')}`);
    } else {
      const error = await response.text();
      console.log(`❌ API Key validation failed: ${response.status} ${error}`);
    }
  } catch (error) {
    console.log(`❌ Error testing API key: ${error.message}`);
  }
}

testOpenAIKey();
