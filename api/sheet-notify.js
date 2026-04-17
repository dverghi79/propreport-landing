const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;

  if (!payload.email || payload.product !== 'PropReport') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!spreadsheetId || !privateKey || !clientEmail) {
    console.error('Missing Google Sheets configuration');
    return res.status(500).json({ error: 'Sheet service not configured' });
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        payload.product || '',
        payload.email || '',
        payload.first_name || '',
        payload.source || '',
        payload.traffic_source || '',
        payload.team_size || '',
        payload.pain || '',
        payload.submitted_at || new Date().toISOString(),
        payload.page_url || '',
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Sheet notify error:', error);
    return res.status(500).json({ error: error.message });
  }
};
