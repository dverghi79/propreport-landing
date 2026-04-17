module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing message text' });
  }

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.error('Missing SLACK_WEBHOOK_URL');
    return res.status(500).json({ error: 'Slack webhook not configured' });
  }

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Slack API error:', error);
      return res.status(500).json({ error: 'Failed to send Slack message' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Slack notify error:', error);
    return res.status(500).json({ error: error.message });
  }
};
