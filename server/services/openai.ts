import { OpenAI } from 'openai';
import { Deck } from '../../src/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_URL
});

export interface GenerateDeckRequest {
  prompt: string;
  categoryName?: string;
  cardCount?: number;
  model?: string;
}

export interface GenerateDeckResponse {
  deck: Omit<Deck, 'id'>;
  success: boolean;
  error?: string;
}

export async function generateDeck(request: GenerateDeckRequest): Promise<GenerateDeckResponse> {
  try {
    const { prompt, categoryName, cardCount = 50, model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo' } = request;
    
    const systemPrompt = `Create a list of things in the category below. Use a json format. Only the name of the items (text) in the list should be returned with a short explanation (info) as a subproperty. There should preferrably around ${cardCount} items, but be sure to ONLY include items that fit the category, even if it results in a short list. Do not add adjectives to the items in the list. If something is related to size or measurements, use absolute values rather than relative. Use common names rather than full names (e.g., "Bill Clinton" rather than "William J. Clinton"). No yapping.

Here is an example:
\`\`\`
{
    emoji: "🏆",
    name: "2024 Oscar Winners",
    description: "Academy Award winners from the 96th ceremony!",
    cards: [
      { id: 1, text: "Oppenheimer", info: "Best Picture - Christopher Nolan's biographical thriller about the atomic bomb creator" },
      { id: 2, text: "Cillian Murphy", info: "Best Actor - Portrayed J. Robert Oppenheimer in the title role" },
      { id: 3, text: "Emma Stone", info: "Best Actress - Won for 'Poor Things' as Bella Baxter" },
      { id: 4, text: "Robert Downey Jr.", info: "Best Supporting Actor - Won for 'Oppenheimer' as Lewis Strauss" },
      { id: 5, text: "Da'Vine Joy Randolph", info: "Best Supporting Actress - Won for 'The Holdovers' as Mary Lamb" },
      { id: 6, text: "Christopher Nolan", info: "Best Director - Finally won his first Oscar for 'Oppenheimer'" },
      { id: 7, text: "Poor Things", info: "Best Production Design - Surreal Victorian-era fantasy world" },
      { id: 8, text: "The Zone of Interest", info: "Best International Feature - Haunting Holocaust drama from the UK" },
      { id: 9, text: "American Fiction", info: "Best Adapted Screenplay - Satirical comedy-drama about identity" },
      { id: 10, text: "Anatomy of a Fall", info: "Best Original Screenplay - French courtroom drama thriller" },
      { id: 11, text: "The Boy and the Heron", info: "Best Animated Feature - Hayao Miyazaki's return to directing" },
      { id: 12, text: "20 Days in Mariupol", info: "Best Documentary Feature - Ukrainian war documentary" },
      { id: 13, text: "War Is Over!", info: "Best Animated Short - Anti-war message through child's perspective" },
      { id: 14, text: "The Wonderful Story of Henry Sugar", info: "Best Live Action Short - Wes Anderson's Roald Dahl adaptation" },
      { id: 15, text: "What Was I Made For?", info: "Best Original Song - Billie Eilish's ballad from 'Barbie'" }
    ]
  }
\`\`\``;

    const userPrompt = categoryName 
      ? `Create a deck of cards for the category "${categoryName}" based on this prompt: ${prompt}`
      : `Create a deck of cards based on this prompt: ${prompt}`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response, handling markdown code blocks and JS object notation
    let deckData;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try parsing as-is first
      try {
        deckData = JSON.parse(cleanContent);
      } catch (firstParseError) {
        // If it fails, try to fix JavaScript object notation to valid JSON
        console.log('First JSON parse failed, attempting to fix JS object notation...');
        
        // Fix unquoted property names (common AI response issue)
        let fixedContent = cleanContent
          // Add quotes around unquoted property names
          .replace(/(\w+):\s*"/g, '"$1": "')
          .replace(/(\w+):\s*\[/g, '"$1": [')
          .replace(/(\w+):\s*\{/g, '"$1": {')
          .replace(/(\w+):\s*(\d+)/g, '"$1": $2')
          .replace(/(\w+):\s*(true|false|null)/g, '"$1": $2');
        
        try {
          deckData = JSON.parse(fixedContent);
        } catch (secondParseError) {
          console.error('OpenAI response content:', content);
          console.error('Fixed content attempt:', fixedContent);
          throw new Error(`Invalid JSON response from OpenAI after fix attempt: ${secondParseError}`);
        }
      }
    } catch (parseError) {
      console.error('OpenAI response content:', content);
      throw new Error(`Invalid JSON response from OpenAI: ${parseError}`);
    }

    // Validate the structure
    if (!deckData.name || !deckData.description || !deckData.emoji || !Array.isArray(deckData.cards)) {
      throw new Error('Invalid deck structure received from OpenAI');
    }

    // Validate cards
    for (const card of deckData.cards) {
      if (!card.id || !card.text) {
        throw new Error('Invalid card structure in deck');
      }
    }

    return {
      deck: deckData,
      success: true
    };

  } catch (error) {
    console.error('Error generating deck:', error);
    return {
      deck: {} as Omit<Deck, 'id'>,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}