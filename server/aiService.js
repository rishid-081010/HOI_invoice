/**
 * AI Message Generation Service
 * Supports Google Gemini API & Local Ollama Fallback.
 * Drafts personalized invoice reminder emails preserving required variables.
 */

let currentGeminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

export function setGeminiApiKey(key) {
  if (key && typeof key === 'string') {
    currentGeminiKey = key.trim();
  }
}

export function getGeminiApiKey() {
  return currentGeminiKey;
}

/**
 * Generates personalized email subject and body using Gemini or Ollama.
 * @param {Object} invoice - Invoice data object
 * @param {string} provider - 'gemini' | 'ollama' | 'template'
 * @param {string} [customApiKey] - Optional runtime Gemini API key
 * @returns {Promise<{ subject: string, body: string, providerUsed: string }>}
 */
export async function generateAIMessage(invoice, provider = 'gemini', customApiKey = '') {
  const apiKey = customApiKey || currentGeminiKey;
  const invoiceNum = invoice.invoiceId || invoice.id || 'INV-000';
  const personName = invoice.contactPerson || invoice.clientName || 'Client';
  const amount = invoice.amount || 0;
  const dueDate = invoice.dueDate || '';
  const paymentLink = invoice.paymentLink || 'https://invoice-tracker-vcwo.onrender.com/payment';
  const stage = invoice.stage || invoice.currentStage || 1;

  let toneInstruction = "Stage 1: Friendly and polite reminder.";
  if (stage === 2) toneInstruction = "Stage 2: Urgent and assertive reminder asking them to pay ASAP.";
  if (stage >= 3) toneInstruction = "Stage 3: Final notice warning that cancellation of service may occur if not paid immediately.";

  const promptText = `You are an executive AI Collections Manager for a company. Draft a personalized email reminder for an overdue invoice.
Tone Guidelines: ${toneInstruction}

CRITICAL MANDATORY REQUIREMENT: You MUST include and preserve these EXACT parameter values in your generated email body text:
- Invoice ID: ${invoiceNum}
- Person Name: ${personName}
- Amount Due: ₹${amount.toLocaleString()}
- Due Date: ${dueDate}
- Payment Link: ${paymentLink}

Respond strictly in valid JSON format with keys "subject" and "body". Example:
{
  "subject": "Reminder regarding Invoice ${invoiceNum}",
  "body": "Hey ${personName}, your Invoice ID is ${invoiceNum}. You have an unpaid invoice of ₹${amount.toLocaleString()} due on ${dueDate}. Please pay via ${paymentLink}."
}`;

  // 1. Try Gemini API via Vertex AI using GCP Credentials
  if (provider === 'gemini') {
    try {
      console.log(`[aiService] Calling Vertex AI Gemini for Invoice #${invoiceNum}...`);
      
      const gcpKeyPath = 'C:\\Users\\Rishi D\\OneDrive\\Desktop\\Hustle\\GCP Credentials.json';
      process.env.GOOGLE_APPLICATION_CREDENTIALS = gcpKeyPath;
      
      let projectId = 'your-project-id';
      try {
        const fs = await import('fs');
        const creds = JSON.parse(fs.readFileSync(gcpKeyPath, 'utf8'));
        projectId = creds.project_id;
      } catch (e) {
        console.warn('[aiService] Failed to read GCP credentials file:', e.message);
      }

      const { VertexAI } = await import('@google-cloud/vertexai');
      const vertex_ai = new VertexAI({ project: projectId, location: 'us-central1' });
      
      // Use gemini-1.5-flash which is widely available on Vertex
      const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const response = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });

      if (response && response.response) {
        const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = parseAIJsonResponse(text, invoiceNum, personName, amount, dueDate, paymentLink, stage);
        if (parsed) {
          console.log(`[aiService] Vertex AI successfully generated email for Invoice #${invoiceNum}`);
          return { ...parsed, providerUsed: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('[aiService] Vertex AI error:', err.message);
    }
  }

  // 2. Try Local Ollama Fallback
  if (provider === 'ollama') {
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
      const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
      console.log(`[aiService] Calling Local Ollama (${ollamaModel} @ ${ollamaUrl}) for Invoice #${invoiceNum}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: promptText,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const parsed = parseAIJsonResponse(data.response, invoiceNum, personName, amount, dueDate, paymentLink, stage);
        if (parsed) {
          console.log(`[aiService] Local Ollama successfully generated email for Invoice #${invoiceNum}`);
          return { ...parsed, providerUsed: 'ollama' };
        }
      }
    } catch (err) {
      console.warn('[aiService] Local Ollama API unavailable/offline:', err.message);
    }
  }

  // 3. Fallback to Dynamic Stage-Based Template Engine
  console.log(`[aiService] Using template fallback engine for Invoice #${invoiceNum}`);
  return getTemplateMessage(invoiceNum, personName, amount, dueDate, paymentLink, stage);
}

function parseAIJsonResponse(rawText, invoiceNum, personName, amount, dueDate, paymentLink, stage) {
  if (!rawText) return null;

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.subject && parsed.body) {
        return {
          subject: String(parsed.subject).trim(),
          body: String(parsed.body).trim()
        };
      }
    }
  } catch (e) {
    // If rawText isn't strict JSON, clean up markdown fences
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    if (cleanText.length > 20) {
      const defaultSubject = stage === 1 
        ? `Reminder about your unpaid invoice` 
        : stage === 2 
          ? `URGENT: Second Reminder for Unpaid Invoice` 
          : `FINAL NOTICE: Overdue Invoice - Service Cancellation Warning`;
      return {
        subject: defaultSubject,
        body: cleanText
      };
    }
  }
  return null;
}

function getTemplateMessage(invoiceNum, personName, amount, dueDate, paymentLink, stage) {
  let subject = "Reminder about your unpaid invoice";
  let body = `Hey ${personName}, your Invoice ID is ${invoiceNum}. You have an unpaid invoice of ₹${amount.toLocaleString()} that was due on ${dueDate}. Kindly pay via ${paymentLink}. Thank you`;

  if (stage === 2) {
    subject = "URGENT: Second Reminder for Unpaid Invoice";
    body = `Hey ${personName}, your Invoice ID is ${invoiceNum}. Your payment of ₹${amount.toLocaleString()} was due on ${dueDate} and is now overdue. Please process this payment ASAP to keep your account in good standing. Pay here: ${paymentLink}. Thank you`;
  } else if (stage >= 3) {
    subject = "FINAL NOTICE: Overdue Invoice - Service Cancellation Warning";
    body = `Hey ${personName}, your Invoice ID is ${invoiceNum}. Your invoice of ₹${amount.toLocaleString()} was due on ${dueDate} and remains severely overdue. Please be advised that immediate payment is required to avoid cancellation of service. Kindly settle immediately via ${paymentLink}. Thank you`;
  }

  return { subject, body, providerUsed: 'template' };
}
