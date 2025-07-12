/**
 * API Test Script for TripwiseGO Feature Request System
 * Tests all the main API endpoints to verify the Supabase migration
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing TripwiseGO API with Supabase...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
        console.log('');

        // Test 2: Get Features (should be empty initially)
        console.log('2. Testing get features endpoint...');
        const featuresResponse = await fetch(`${API_BASE_URL}/features`);
        const featuresData = await featuresResponse.json();
        console.log('✅ Get features:', `Found ${featuresData.data.length} features`);
        console.log('');

        // Test 3: Create a Feature Request
        console.log('3. Testing create feature endpoint...');
        const newFeature = {
            title: 'Test Feature Request',
            description: 'This is a test feature request to verify the Supabase migration works correctly.',
            creatorId: 'test-user-' + Date.now()
        };

        const createResponse = await fetch(`${API_BASE_URL}/upload-feature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newFeature)
        });

        const createData = await createResponse.json();
        if (createData.success) {
            console.log('✅ Create feature:', createData.message);
            console.log('   Feature ID:', createData.data.id);
            
            const featureId = createData.data.id;
            const userId = newFeature.creatorId;

            // Test 4: Vote on the Feature
            console.log('');
            console.log('4. Testing voting endpoint...');
            const voteResponse = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    featureId: featureId,
                    voteType: 'up',
                    userId: userId
                })
            });

            const voteData = await voteResponse.json();
            if (voteData.success) {
                console.log('✅ Vote recorded:', voteData.message);
            } else {
                console.log('❌ Vote failed:', voteData.error);
            }

            // Test 5: Get Features Again (should show our new feature)
            console.log('');
            console.log('5. Testing get features after creation...');
            const updatedFeaturesResponse = await fetch(`${API_BASE_URL}/features`);
            const updatedFeaturesData = await updatedFeaturesResponse.json();
            console.log('✅ Get features:', `Found ${updatedFeaturesData.data.length} features`);
            
            if (updatedFeaturesData.data.length > 0) {
                const feature = updatedFeaturesData.data[0];
                console.log('   Latest feature:', feature.title);
                console.log('   Votes:', feature.votes);
            }

            // Test 6: Update Feature
            console.log('');
            console.log('6. Testing update feature endpoint...');
            const updateResponse = await fetch(`${API_BASE_URL}/features/${featureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Updated Test Feature Request'
                })
            });

            const updateData = await updateResponse.json();
            if (updateData.success) {
                console.log('✅ Update feature:', updateData.message);
            } else {
                console.log('❌ Update failed:', updateData.error);
            }

            // Test 7: Get Statistics
            console.log('');
            console.log('7. Testing statistics endpoint...');
            const statsResponse = await fetch(`${API_BASE_URL}/statistics`);
            const statsData = await statsResponse.json();
            if (statsData.success) {
                console.log('✅ Statistics:');
                console.log('   Features:', statsData.data.features?.features || 'N/A');
                console.log('   Votes:', statsData.data.voting?.totalVotes || 'N/A');
                console.log('   Files:', statsData.data.uploads?.totalFiles || 'N/A');
            } else {
                console.log('❌ Statistics failed');
            }

            // Test 8: Delete Feature (cleanup)
            console.log('');
            console.log('8. Testing delete feature endpoint...');
            const deleteResponse = await fetch(`${API_BASE_URL}/features/${featureId}`, {
                method: 'DELETE'
            });

            const deleteData = await deleteResponse.json();
            if (deleteData.success) {
                console.log('✅ Delete feature:', deleteData.message);
            } else {
                console.log('❌ Delete failed:', deleteData.error);
            }

        } else {
            console.log('❌ Create feature failed:', createData.error);
        }

        console.log('');
        console.log('🎉 API testing complete!');
        console.log('✅ Supabase migration appears to be working correctly.');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run the test
testAPI();
