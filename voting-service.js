/**
 * Voting Service for TripwiseGO Feature Request System
 * Handles all voting operations with duplicate prevention and vote tracking
 */

const { supabase } = require('./supabase-config');

class VotingService {

    /**
     * Handle voting on a feature
     */
    async voteOnFeature(featureId, voteType, userId) {
        try {
            // Validate input parameters
            if (!featureId || !voteType || !userId) {
                throw new Error('FeatureId, voteType, and userId are required for voting');
            }

            if (voteType !== 'up' && voteType !== 'down') {
                throw new Error('VoteType must be "up" or "down"');
            }

            // Check if feature exists
            const { data: feature, error: featureError } = await supabase
                .from('feature_requests')
                .select('id')
                .eq('id', featureId)
                .eq('status', 'active')
                .single();

            if (featureError || !feature) {
                throw new Error('Feature not found or not active');
            }

            // Check if user has already voted on this feature
            const existingVote = await this.findExistingVote(featureId, userId);

            if (existingVote) {
                if (existingVote.vote_type === voteType) {
                    throw new Error('User has already voted on this feature with the same vote type');
                } else {
                    // User is changing their vote - update the existing vote
                    return await this.updateExistingVote(existingVote.id, voteType);
                }
            } else {
                // Record new vote
                return await this.recordNewVote(featureId, voteType, userId);
            }

        } catch (error) {
            console.error('Error in voteOnFeature:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Find existing vote by user for a feature
     */
    async findExistingVote(featureId, userId) {
        try {
            const { data, error } = await supabase
                .from('votes')
                .select('*')
                .eq('feature_id', featureId)
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(`Failed to check existing vote: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error in findExistingVote:', error);
            return null;
        }
    }

    /**
     * Record a new vote
     */
    async recordNewVote(featureId, voteType, userId) {
        try {
            const voteData = {
                feature_id: featureId,
                vote_type: voteType,
                user_id: userId,
                timestamp: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('votes')
                .insert([voteData])
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to record vote: ${error.message}`);
            }

            return {
                success: true,
                message: 'Vote recorded successfully',
                data: {
                    featureId: featureId,
                    voteType: voteType,
                    userId: userId
                }
            };
        } catch (error) {
            console.error('Error in recordNewVote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update an existing vote
     */
    async updateExistingVote(voteId, newVoteType) {
        try {
            const { data, error } = await supabase
                .from('votes')
                .update({
                    vote_type: newVoteType,
                    timestamp: new Date().toISOString()
                })
                .eq('id', voteId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update vote: ${error.message}`);
            }

            return {
                success: true,
                message: 'Vote updated successfully',
                data: {
                    featureId: data.feature_id,
                    voteType: data.vote_type,
                    userId: data.user_id
                }
            };
        } catch (error) {
            console.error('Error in updateExistingVote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get vote count for a specific feature
     */
    async getFeatureVoteCount(featureId) {
        try {
            const { data: upVotes, error: upError } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('feature_id', featureId)
                .eq('vote_type', 'up');

            const { data: downVotes, error: downError } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('feature_id', featureId)
                .eq('vote_type', 'down');

            if (upError || downError) {
                throw new Error('Failed to get vote count');
            }

            const totalVotes = Math.max((upVotes || 0) - (downVotes || 0), 0);

            return {
                success: true,
                data: {
                    upVotes: upVotes || 0,
                    downVotes: downVotes || 0,
                    totalVotes: totalVotes
                }
            };
        } catch (error) {
            console.error('Error in getFeatureVoteCount:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all votes for a user
     */
    async getUserVotes(userId) {
        try {
            const { data, error } = await supabase
                .from('votes')
                .select('feature_id, vote_type, timestamp')
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Failed to get user votes: ${error.message}`);
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Error in getUserVotes:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remove a vote (for vote cancellation)
     */
    async removeVote(featureId, userId) {
        try {
            const { data, error } = await supabase
                .from('votes')
                .delete()
                .eq('feature_id', featureId)
                .eq('user_id', userId)
                .select();

            if (error) {
                throw new Error(`Failed to remove vote: ${error.message}`);
            }

            return {
                success: true,
                message: 'Vote removed successfully',
                data: { featureId, userId }
            };
        } catch (error) {
            console.error('Error in removeVote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get voting statistics
     */
    async getVotingStatistics() {
        try {
            const { count: totalVotes, error: totalError } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true });

            const { count: upVotes, error: upError } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('vote_type', 'up');

            const { count: downVotes, error: downError } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('vote_type', 'down');

            if (totalError || upError || downError) {
                throw new Error('Failed to get voting statistics');
            }

            return {
                success: true,
                data: {
                    totalVotes: totalVotes || 0,
                    upVotes: upVotes || 0,
                    downVotes: downVotes || 0,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error in getVotingStatistics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new VotingService();
