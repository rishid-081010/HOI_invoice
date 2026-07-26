import fs from 'fs';
import crypto from 'crypto';

const CRED_PATH = "C:\\Users\\Rishi D\\OneDrive\\Desktop\\Hustle\\GCP Credentials.json";

async function getAccessToken(cred) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: cred.client_email,
    scope: 'https://www.googleapis.com/auth/generative-language https://www.googleapis.com/auth/cloud-platform',
    aud: cred.token_uri,
    exp: now + 3600,
    iat: now
  };

  const base64Url = (str) =>
    Buffer.from(typeof str === 'string' ? str : JSON.stringify(str))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(cred.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  const response = await fetch(cred.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function testGemini() {
  try {
    const raw = fs.readFileSync(CRED_PATH, 'utf8');
    const cred = JSON.parse(raw);
    const token = await getAccessToken(cred);
    console.log('Successfully acquired OAuth2 Access Token!');

    // 1. Try Generative Language API endpoint with Bearer token
    console.log('Testing GenerativeLanguage API endpoint...');
    const genLangUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    const res1 = await fetch(genLangUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Draft a 1-sentence friendly reminder for invoice #101.' }]
        }]
      })
    });
    console.log('GenerativeLanguage Status:', res1.status);
    const data1 = await res1.json();
    console.log('GenerativeLanguage Result:', JSON.stringify(data1, null, 2));

  } catch (err) {
    console.error('Error during GCP test:', err);
  }
}

testGemini();
