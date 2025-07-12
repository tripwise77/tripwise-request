const { google } = require('googleapis');

// Same service account function as upload-feature.js
const getServiceAccount = () => {
  // Try environment variables first (recommended for Netlify)
  if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
    console.log('Using environment variables for service account');
    
    // Properly format the private key - handle both \n and \\n cases
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    // If the private key doesn't start with -----BEGIN, it might be base64 encoded
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('Private key appears to be base64 encoded, decoding...');
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
      } catch (e) {
        console.log('Failed to decode base64, using as-is');
      }
    }
    
    // Ensure proper newline formatting
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Validate the private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format in environment variables');
    }
    
    return {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID || 'gen-lang-client-0709338611',
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '3e3885510f27a3e91b4616504d5532582b8b514e',
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID || '114276289014444285319',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`,
      universe_domain: 'googleapis.com'
    };
  }
  
  // Fallback to embedded credentials with proper formatting
  console.log('Using embedded service account credentials');
  const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxHmq/G7a8/gsg
IxjIBr2oQbkgTSKq7Q70syaqUMN+xkQVKxihZLYwYbpSCmmMPtFYiRFk57agy9Y0
Ll4ZyIIIVTgwwY22JHEurJbcJtaasZuBNzAR8Fo8lKg6eL90v9vUh+yRBSdcnyk9
wVhJEAx/6litBG/aG4t8xszj32pBBW5/pQjsZ/iTLfwZsOPnMm5YTCWGD8uOTN4d
mrsvYo2gJJuFw1Z+m+e6Kf7wQL5cXWLXpvGivNxZZkouMxBGRVTjm0mtZgaVoJl3
i7JzIemSlA3pL/OgCq7h5svX/HAwuCwrrtnA8pGcGWSDHrENcj6EDlX+U65fx/ER
uhwP14aPAgMBAAECggEAHquSN4Kgi6yAF7IMJgMIz3yGBqJkyO1g5B2rqd1vZOIH
QxUh4Dy00b7yiSdVbJwqGyctFGiNdt2lO4b184gFgFTldIfntq0rzjXDr96n1cTA
lUkNsWWJ8qiZUvq6yIg6lFxvKhOW49KJzTBQTeKSD4pwjZFRnxaa+mHgc+splpWD
/9xJp72OpWZ0KM6Ubpw8UJER/emNG0iFVfcklWqSCPMj2VdgDcrGsVMMhIxf6D6q
3T0fVFLroNz8fhZha7VOk7rmvkVKSlK5aUTlIff31esDt5c4ouC8feMiHVHrkSVt
+gkFBNnpeIK1KhPSGv3Q9OXqqZkHbjjxr4k5tQIqcQKBgQD6Epm/4MsQZqBjRYVI
8s9il04CnGA64LFybLF1jMKXW2pwoxB0AckpjxrTK/ANPuLZUPK199vRijbPDxhl
UOZpCNWOcaHacQ3m6eDlRj1sP20RnH+PtelFk4sD8OX7bCGkC9DajEfRDzYCg18+
+LOF9rRO5LgmOHF+RB3O8ev4EQKBgQC1USUDLrVcxw0Jjoc7DlvUO1D6v6XdYRZb
/bAhoZs0DfPL7YhpCAKcgmMlmFRWAwQx+wN9PrUlNQVsulFTZb0SeR58kxlZqZYT
bdeXuiYU3G7DH7LJoGcEY87zcNZwXhtcrbCQUxaMv159Sa6iwRcawPejsppqIm8j
6woenpU0nwKBgQDlwPkpZSqsIt3w1wqh/xOyjTjLBUkUTyQ48MwKKA0Qapjca7TO
IGXlnOkUYyXlxYU+DDUyIkr/tXCtxDyxuSY4EjnC6Xu+6mfPY8mQXHxKW+ulZpd8
PbHYjroGIOnrmWk/AuwcHw5McSE6JeD4Rh8KUaNPaKwX0XvUeli4rWQTQQKBgEmJ
g41q4Dukr3D00XvuMug8tnc8SzUiL0NX/JtnQ9802XAYAn82tHhtmXCh+3J2/riW
qa+eQzG3819JobpFRQ28+dRkhJ+M3EU9A3eSE+faD0IsFQMZfy6UnFa3qQEh6c8I
0td2G2syIkyGGcIAtjIvmUBXK7FoDdNvfEc24iTZAoGATzJzJA+Ic38MBz+Knvtc
qu2QrhFEHtTN20zHBzHp5rjba0hY7Dj1HuNG7G4shCN0FXEtqooz5GypZzw0S1oe
8pam9nIlAnXlc/5nPa0NqaVn4dwTk85iizpQeJEZc70VqqYXXyLt8g5hiQEOwrhf
9Gfrf0cfJzos+IJH4WG/JQU=
-----END PRIVATE KEY-----`;

  return {
    type: 'service_account',
    project_id: 'gen-lang-client-0709338611',
    private_key_id: '3e3885510f27a3e91b4616504d5532582b8b514e',
    private_key: privateKey,
    client_email: 'wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com',
    client_id: '114276289014444285319',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/wanderly-feedback%40gen-lang-client-0709338611.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com'
  };
};

async function diagnoseAuth() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: 'netlify-function',
    checks: []
  };

  try {
    // Check 1: Service Account Loading
    diagnostics.checks.push({ step: 'Loading service account', status: 'starting' });
    const serviceAccount = getServiceAccount();
    diagnostics.checks.push({ 
      step: 'Loading service account', 
      status: 'success',
      details: {
        client_email: serviceAccount.client_email,
        project_id: serviceAccount.project_id,
        private_key_length: serviceAccount.private_key.length,
        private_key_starts_with: serviceAccount.private_key.substring(0, 30),
        private_key_ends_with: serviceAccount.private_key.substring(serviceAccount.private_key.length - 30)
      }
    });

    // Check 2: Private Key Format
    diagnostics.checks.push({ step: 'Validating private key format', status: 'starting' });
    const hasBegin = serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----');
    const hasEnd = serviceAccount.private_key.includes('-----END PRIVATE KEY-----');
    const hasNewlines = serviceAccount.private_key.includes('\n');
    
    if (hasBegin && hasEnd) {
      diagnostics.checks.push({ 
        step: 'Validating private key format', 
        status: 'success',
        details: { hasBegin, hasEnd, hasNewlines }
      });
    } else {
      diagnostics.checks.push({ 
        step: 'Validating private key format', 
        status: 'error',
        error: 'Private key missing BEGIN or END markers',
        details: { hasBegin, hasEnd, hasNewlines }
      });
    }

    // Check 3: Google Auth Initialization
    diagnostics.checks.push({ step: 'Initializing Google Auth', status: 'starting' });
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    diagnostics.checks.push({ step: 'Initializing Google Auth', status: 'success' });

    // Check 4: Getting Auth Client
    diagnostics.checks.push({ step: 'Getting auth client', status: 'starting' });
    const authClient = await auth.getClient();
    diagnostics.checks.push({ 
      step: 'Getting auth client', 
      status: 'success',
      details: {
        client_type: authClient.constructor.name,
        email: authClient.email || 'unknown'
      }
    });

    // Check 5: Testing Sheets API
    diagnostics.checks.push({ step: 'Testing Sheets API', status: 'starting' });
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    // Try to read from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '18_dYxomtS1cjaKi6hWTiNHuELOcjnunf-2qOotPML4s',
      range: 'Feature Request!A1:F1',
    });
    
    diagnostics.checks.push({ 
      step: 'Testing Sheets API', 
      status: 'success',
      details: {
        spreadsheet_accessible: true,
        response_data: response.data.values || 'no data'
      }
    });

    diagnostics.overall_status = 'success';
    diagnostics.message = 'All authentication checks passed successfully!';

  } catch (error) {
    diagnostics.checks.push({ 
      step: 'Authentication test', 
      status: 'error',
      error: error.message,
      error_code: error.code,
      error_details: {
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack trace
      }
    });
    
    diagnostics.overall_status = 'error';
    diagnostics.message = `Authentication failed: ${error.message}`;
  }

  return diagnostics;
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const diagnostics = await diagnoseAuth();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(diagnostics, null, 2)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Diagnostic function failed',
          details: error.message,
          timestamp: new Date().toISOString()
        }, null, 2)
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
