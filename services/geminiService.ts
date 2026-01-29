
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const languageNames: Record<Language, string> = {
  so: "Somali (Af-Soomaali)",
  en: "English",
  ar: "Arabic (العربية)"
};

/** Generates a short daily learning tip */
export const generateDailyTip = async (lang: Language = 'so') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a very short, encouraging tip for learning English. Write it in ${languageNames[lang]}. Max 100 characters. Target the Somali community.`,
      config: { temperature: 0.8 },
    });
    return response.text?.trim() || "Joogteyntu waa furaha guusha!";
  } catch (error) {
    return "Baro hal eray oo cusub maalin kasta!";
  }
};

/** Generates a structured Word of the Day object */
export const generateWordOfTheDay = async (lang: Language = 'so'): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-impact 'Word of the Day' for English learners who speak Somali. Provide the word, its Somali translation, a simple definition in Somali, its pronunciation, and an example sentence. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            somali: { type: Type.STRING }
          },
          required: ["word", "definition", "example", "pronunciation", "somali"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { word: "Consistency", somali: "Joogteyn", definition: "In wax loo qabto si joogto ah.", example: "Consistency is key to learning English.", pronunciation: "Kon-sis-ten-si" };
  }
};

/** Generates speech audio data for a given text */
export const speakText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

/** Generates a streaming Markdown lesson */
export const generateDetailedLessonStream = async (topic: string, difficulty: Difficulty, lang: Language = 'so') => {
  return ai.models.generateContentStream({
    model: "gemini-3-pro-preview",
    contents: `You are Abdis, a world-class English Professor specializing in teaching Somali speakers. 
    Create a comprehensive English lesson about: "${topic}". 
    Target Student Level: ${difficulty}. 
    Instructional Language: ${languageNames[lang]}.
    
    CRITICAL INSTRUCTIONS:
    1. Use REAL Markdown tables for all vocabulary, comparisons, or lists. 
    2. Example table:
       | Erayga (Word) | Lagu dhawaaqo (Pronunciation) | Macnaha (Meaning) | Tusaale (Example) |
       | :--- | :--- | :--- | :--- |
       | Study | /'stʌdi/ | Barasho | I study English daily. |
    3. Do NOT use dashes like --- or slashes like /// to build tables. Only use | pipes.
    4. Ensure the explanation is primarily in Somali to help the student understand.
    
    Format with beautiful Markdown:
    # 📚 [English Title] - [Somali Title]
    
    ## 🌟 Overview (Hordhac)
    A 2-3 sentence engaging intro in Somali explaining why this is important.
    
    ## 🔑 Erayada Muhiimka ah (Vocabulary)
    | Erayga | Lagu dhawaaqo | Macnaha | Tusaale |
    | :--- | :--- | :--- | :--- |
    ... (add at least 5 rows)
    
    ## 🛠 Sharaxaadda (The Rules)
    Explain grammar or context in Somali using bullet points.
    
    ## 💬 Wada-hadal Practice
    A 4-line conversation in English with Somali translations below each line.
    
    ## ✍️ Layli (Exercises)
    3 practice questions for the student.`,
    config: { 
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 2000 }
    },
  });
};

/** Generates a contextual image for a lesson topic */
export const generateLessonImage = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clean, modern, minimalist 3D education illustration for the topic: "${topic}". High-quality textures, soft lighting, vibrant lime green and deep navy blue color palette. Professional educational branding style.` }],
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    return null;
  }
};

/** Creates an interactive tutor chat session */
export const createTutorChat = (lang: Language = 'so') => {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Magacaagu waa Abdis, waxaad tahay macalin Ingiriisi oo aad u saaxiib dhow la ah ardayda Soomaaliyeed.
      Hadafkaagu waa inaad ka caawiso ardayda inay Ingiriisiga si fiican u bartaan.
      - Had iyo jeer ku dhiiri-geli ardayga.
      - Haddii uu ardaygu kugu hadlo Soomaali, ugu jawaab isku dar ah Soomaali (si aad ugu sharaxdo) iyo Ingiriisi (si uu ugu tababarto).
      - Khaladaadka Ingiriisiga ee uu ardaygu sameeyo si tartiib ah ugu sax.
      - Isticmaal emojis si wada hadalku u noqdo mid xiiso leh.
      - Jawaabahaaga ha noqdaan kuwo kooban laakiin faa'iido badan leh.`,
    },
  });
};
