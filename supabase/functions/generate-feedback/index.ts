
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { answerText } = await req.json()
    if (!answerText) {
      return new Response(JSON.stringify({ error: 'answerText is required.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an English writing teacher. Analyze the student's answer and provide structured feedback in JSON format with exactly this structure:
            {
              "structure": [
                {"text": "Feedback point about structure", "isPositive": true/false}
              ],
              "vocabulary": [
                {"text": "Feedback point about vocabulary", "isPositive": true/false}
              ],
              "grammar": [
                {"text": "Feedback point about grammar", "isPositive": true/false}
              ]
            }
            
            Provide 2-4 feedback points per category. Be specific and constructive. Focus on:
            - Structure: organization, flow, introduction, conclusion, paragraphs
            - Vocabulary: word choice, variety, appropriateness, usage
            - Grammar: sentence structure, tenses, punctuation, syntax
            
            Return ONLY the JSON object, no additional text.`
          },
          {
            role: 'user',
            content: answerText
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      const errorMessage = data.error?.message || 'Failed to get feedback from OpenAI.';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const feedbackContent = data.choices[0].message.content.trim();
    
    try {
      // Parse the JSON response to validate it
      const structuredFeedback = JSON.parse(feedbackContent);
      
      return new Response(
        JSON.stringify({ 
          feedback: feedbackContent,
          structured: structuredFeedback
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw content:', feedbackContent);
      
      // If JSON parsing fails, return a fallback structure
      const fallbackFeedback = {
        structure: [
          {"text": "Your answer shows good organization overall.", "isPositive": true}
        ],
        vocabulary: [
          {"text": "Consider using more varied vocabulary.", "isPositive": false}
        ],
        grammar: [
          {"text": "Grammar usage is generally correct.", "isPositive": true}
        ]
      };
      
      return new Response(
        JSON.stringify({ 
          feedback: JSON.stringify(fallbackFeedback),
          structured: fallbackFeedback
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in generate-feedback function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, // Return 200 but with an error payload
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
