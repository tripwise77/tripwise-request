const supabase = require('./supabase-client');

exports.handler = async function(event, context) {
  try {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
        },
        body: ''
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse request body
    const requestBody = JSON.parse(event.body);
    const { featureId, voteType, userId } = requestBody;

    // Validate required fields
    if (!featureId || !voteType || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Feature ID, vote type, and user ID are required' })
      };
    }

    // Check if user has already voted
    const { data: existingVote, error: voteError } = await supabase
      .from('votes')
      .select('*')
      .eq('feature_id', featureId)
      .eq('user_id', userId);

    if (voteError) throw voteError;

    if (existingVote && existingVote.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'User has already voted for this feature' })
      };
    }

    // Record the vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert([
        { 
          feature_id: featureId, 
          user_id: userId,
          vote_type: voteType
        }
      ]);

    if (insertError) throw insertError;

    // Update feature vote count
    const voteChange = voteType === 'up' ? 1 : -1;
    
    const { data, error } = await supabase
      .from('features')
      .update({ votes: supabase.rpc('increment', { x: voteChange }) })
      .eq('id', featureId)
      .select();

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data[0])
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};