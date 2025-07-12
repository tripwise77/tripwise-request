/**
 * Supabase Service Layer for TripwiseGO Feature Request System
 * Handles all CRUD operations for feature requests and votes
 */

const { supabase } = require('./supabase-config');

class SupabaseService {
    
    /**
     * Get all active feature requests
     */
    async getFeatures() {
        try {
            const { data, error } = await supabase
                .from('feature_requests')
                .select('*')
                .eq('status', 'active')
                .order('date', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch features: ${error.message}`);
            }

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Error in getFeatures:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get a specific feature request by ID
     */
    async getFeature(featureId) {
        try {
            const { data, error } = await supabase
                .from('feature_requests')
                .select('*')
                .eq('id', featureId)
                .eq('status', 'active')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Feature not found');
                }
                throw new Error(`Failed to fetch feature: ${error.message}`);
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error in getFeature:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Add a new feature request
     */
    async addFeature(featureData) {
        try {
            // Validate required fields
            if (!featureData.title || !featureData.description) {
                throw new Error('Title and description are required');
            }

            const newFeature = {
                id: featureData.id || this.generateId(),
                title: featureData.title.trim(),
                description: featureData.description.trim(),
                votes: parseInt(featureData.votes) || 0,
                date: featureData.date || new Date().toISOString(),
                creator_id: featureData.creatorId || featureData.creator_id || 'anonymous',
                status: featureData.status || 'active'
            };

            const { data, error } = await supabase
                .from('feature_requests')
                .insert([newFeature])
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to add feature: ${error.message}`);
            }

            return {
                success: true,
                message: 'Feature added successfully',
                data: data
            };
        } catch (error) {
            console.error('Error in addFeature:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update an existing feature request
     */
    async updateFeature(featureId, updates) {
        try {
            if (!featureId) {
                throw new Error('Feature ID is required for update');
            }

            // Prepare update object
            const updateData = {};
            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.votes !== undefined) updateData.votes = parseInt(updates.votes);
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.creator_id !== undefined) updateData.creator_id = updates.creator_id;

            const { data, error } = await supabase
                .from('feature_requests')
                .update(updateData)
                .eq('id', featureId)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Feature not found');
                }
                throw new Error(`Failed to update feature: ${error.message}`);
            }

            return {
                success: true,
                message: 'Feature updated successfully',
                data: data
            };
        } catch (error) {
            console.error('Error in updateFeature:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a feature request (soft delete by setting status to 'deleted')
     */
    async deleteFeature(featureId) {
        try {
            if (!featureId) {
                throw new Error('Feature ID is required for deletion');
            }

            const { data, error } = await supabase
                .from('feature_requests')
                .update({ status: 'deleted' })
                .eq('id', featureId)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Feature not found');
                }
                throw new Error(`Failed to delete feature: ${error.message}`);
            }

            return {
                success: true,
                message: 'Feature deleted successfully',
                data: { id: featureId }
            };
        } catch (error) {
            console.error('Error in deleteFeature:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a unique ID for new features
     */
    generateId() {
        return 'feature-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Check if a feature exists
     */
    async featureExists(featureId) {
        try {
            const { data, error } = await supabase
                .from('feature_requests')
                .select('id')
                .eq('id', featureId)
                .single();

            return !error && data;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get statistics about features and votes
     */
    async getStatistics() {
        try {
            const { count: featureCount, error: featureError } = await supabase
                .from('feature_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            const { count: voteCount, error: voteError } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true });

            if (featureError || voteError) {
                throw new Error('Failed to get statistics');
            }

            return {
                success: true,
                data: {
                    features: featureCount || 0,
                    votes: voteCount || 0,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error in getStatistics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new SupabaseService();
