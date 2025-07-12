const { google } = require('googleapis');

// Get service account credentials with proper error handling
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
const SPREADSHEET_ID = '18_dYxomtS1cjaKi6hWTiNHuELOcjnunf-2qOotPML4s';
const SHEET_NAME = 'Feature Request';

async function uploadToGoogleSheets(featureData) {
  try {
    console.log('Initializing Google Auth...');

    // Get service account credentials
    const serviceAccount = getServiceAccount();
    console.log('Service account loaded, client_email:', serviceAccount.client_email);
    console.log('Private key length:', serviceAccount.private_key.length);
    console.log('Private key starts with:', serviceAccount.private_key.substring(0, 50));

    // Validate the private key format
    if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format - missing BEGIN marker');
    }
    if (!serviceAccount.private_key.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format - missing END marker');
    }

    // Create auth with explicit credentials
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('GoogleAuth instance created successfully');

    console.log('Getting auth client...');
    const authClient = await auth.getClient();
    console.log('Auth client obtained successfully');

    const sheets = google.sheets({ version: 'v4', auth: authClient });
    console.log('Google Sheets API client initialized');

    const values = [
      [
        featureData.id,
        featureData.title,
        featureData.description,
        featureData.votes || 0,
        featureData.date,
        featureData.creatorId || 'anonymous'
      ]
    ];

    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values
      }
    };

    console.log('Sending request to Google Sheets API...');
    console.log('Request details:', JSON.stringify(request, null, 2));

    const response = await sheets.spreadsheets.values.append(request);
    console.log('Google Sheets API response received:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error uploading to Google Sheets:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    throw error;
  }
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

  if (event.httpMethod === 'POST') {
    try {
      console.log('Processing POST request...');
      console.log('Event body:', event.body);

      const { title, description, creatorId } = JSON.parse(event.body);
      console.log('Parsed request data:', { title, description, creatorId });

      // Validation
      if (!title || !description) {
        console.log('Validation failed: missing title or description');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Title and description are required'
          })
        };
      }

      if (title.trim().length < 3) {
        console.log('Validation failed: title too short');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Title must be at least 3 characters long'
          })
        };
      }

      const featureData = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        votes: 0,
        date: new Date().toISOString(),
        creatorId: creatorId || 'anonymous'
      };

      console.log('Feature data prepared:', featureData);
      console.log('Calling uploadToGoogleSheets...');

      await uploadToGoogleSheets(featureData);

      console.log('Upload successful, returning response');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Feature request uploaded to Google Spreadsheet successfully',
          data: featureData
        })
      };
    } catch (error) {
      console.error('Error in upload function:', error);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to upload feature request to Google Spreadsheet';
      let statusCode = 500;

      if (error.message && error.message.includes('invalid_grant')) {
        errorMessage = 'Google authentication failed - invalid service account credentials';
        console.error('Authentication error detected');
      } else if (error.message && error.message.includes('Invalid JWT')) {
        errorMessage = 'Google authentication failed - invalid JWT signature';
        console.error('JWT signature error detected');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Network error - unable to connect to Google Sheets API';
        statusCode = 503;
      }

      return {
        statusCode: statusCode,
        headers,
        body: JSON.stringify({
          success: false,
          error: errorMessage,
          details: error.message,
          timestamp: new Date().toISOString()
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
