const { google } = require('googleapis');

// Service account credentials with properly formatted private key
const getServiceAccount = () => {
  // Fix the private key formatting by replacing \\n with actual newlines
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
    "type": "service_account",
    "project_id": "gen-lang-client-0709338611",
    "private_key_id": "3e3885510f27a3e91b4616504d5532582b8b514e",
    "private_key": privateKey,
    "client_email": "wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com",
    "client_id": "114276289014444285319",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/wanderly-feedback%40gen-lang-client-0709338611.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };
};

const SPREADSHEET_ID = '18_dYxomtS1cjaKi6hWTiNHuELOcjnunf-2qOotPML4s';
const SHEET_NAME = 'Feature Request';

async function readFromGoogleSheets() {
  try {
    console.log('Initializing Google Auth for reading...');

    // Get service account credentials
    const serviceAccount = getServiceAccount();
    console.log('Service account loaded for reading, client_email:', serviceAccount.client_email);

    // Create auth with explicit credentials
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('GoogleAuth instance created successfully for reading');

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    };

    const response = await sheets.spreadsheets.values.get(request);
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    const features = rows.map(row => ({
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || '',
      votes: parseInt(row[3]) || 0,
      date: row[4] || '',
      creatorId: row[5] || 'anonymous'
    }));

    return features;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
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

  if (event.httpMethod === 'GET') {
    try {
      const features = await readFromGoogleSheets();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: features
        })
      };
    } catch (error) {
      console.error('Error in features function:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch feature requests',
          details: error.message
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
