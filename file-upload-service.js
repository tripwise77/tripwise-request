/**
 * File Upload Service for TripwiseGO Feature Request System
 * Handles file uploads using Supabase Storage
 */

const { supabase } = require('./supabase-config');
const path = require('path');

class FileUploadService {

    constructor() {
        this.bucketName = 'feature-attachments';
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
    }

    /**
     * Initialize storage bucket (create if doesn't exist)
     */
    async initializeBucket() {
        try {
            // Check if bucket exists
            const { data: buckets, error: listError } = await supabase.storage.listBuckets();
            
            if (listError) {
                throw new Error(`Failed to list buckets: ${listError.message}`);
            }

            const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);

            if (!bucketExists) {
                // Create bucket
                const { data, error } = await supabase.storage.createBucket(this.bucketName, {
                    public: true,
                    allowedMimeTypes: this.allowedMimeTypes,
                    fileSizeLimit: this.maxFileSize
                });

                if (error) {
                    throw new Error(`Failed to create bucket: ${error.message}`);
                }

                console.log(`✅ Created storage bucket: ${this.bucketName}`);
            }

            return {
                success: true,
                message: `Bucket ${this.bucketName} is ready`
            };
        } catch (error) {
            console.error('Error in initializeBucket:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload a file to Supabase Storage
     */
    async uploadFile(file, featureId, uploadedBy) {
        try {
            // Validate inputs
            if (!file || !featureId || !uploadedBy) {
                throw new Error('File, featureId, and uploadedBy are required');
            }

            // Validate file size
            if (file.size > this.maxFileSize) {
                throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
            }

            // Validate file type
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new Error(`File type ${file.mimetype} is not allowed`);
            }

            // Generate unique file name
            const fileExtension = path.extname(file.originalname);
            const fileName = `${featureId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;

            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(this.bucketName)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                throw new Error(`Failed to upload file: ${uploadError.message}`);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);

            // Save file metadata to database
            const fileMetadata = {
                feature_id: featureId,
                file_name: file.originalname,
                file_path: fileName,
                file_size: file.size,
                mime_type: file.mimetype,
                uploaded_by: uploadedBy
            };

            const { data: dbData, error: dbError } = await supabase
                .from('file_attachments')
                .insert([fileMetadata])
                .select()
                .single();

            if (dbError) {
                // If database insert fails, try to delete the uploaded file
                await this.deleteFile(fileName);
                throw new Error(`Failed to save file metadata: ${dbError.message}`);
            }

            return {
                success: true,
                message: 'File uploaded successfully',
                data: {
                    id: dbData.id,
                    fileName: file.originalname,
                    filePath: fileName,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    publicUrl: urlData.publicUrl,
                    uploadedAt: dbData.uploaded_at
                }
            };

        } catch (error) {
            console.error('Error in uploadFile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all files for a feature request
     */
    async getFeatureFiles(featureId) {
        try {
            const { data, error } = await supabase
                .from('file_attachments')
                .select('*')
                .eq('feature_id', featureId)
                .order('uploaded_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to get feature files: ${error.message}`);
            }

            // Add public URLs to the response
            const filesWithUrls = data.map(file => {
                const { data: urlData } = supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(file.file_path);

                return {
                    ...file,
                    publicUrl: urlData.publicUrl
                };
            });

            return {
                success: true,
                data: filesWithUrls
            };
        } catch (error) {
            console.error('Error in getFeatureFiles:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(filePath, fileId = null) {
        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            if (storageError) {
                console.warn(`Failed to delete file from storage: ${storageError.message}`);
            }

            // Delete from database if fileId is provided
            if (fileId) {
                const { error: dbError } = await supabase
                    .from('file_attachments')
                    .delete()
                    .eq('id', fileId);

                if (dbError) {
                    console.warn(`Failed to delete file metadata: ${dbError.message}`);
                }
            }

            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            console.error('Error in deleteFile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete all files for a feature request
     */
    async deleteFeatureFiles(featureId) {
        try {
            // Get all files for the feature
            const filesResult = await this.getFeatureFiles(featureId);
            
            if (!filesResult.success) {
                throw new Error(filesResult.error);
            }

            // Delete each file
            for (const file of filesResult.data) {
                await this.deleteFile(file.file_path, file.id);
            }

            return {
                success: true,
                message: `Deleted ${filesResult.data.length} files for feature ${featureId}`
            };
        } catch (error) {
            console.error('Error in deleteFeatureFiles:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get file upload statistics
     */
    async getUploadStatistics() {
        try {
            const { count: totalFiles, error: countError } = await supabase
                .from('file_attachments')
                .select('*', { count: 'exact', head: true });

            const { data: sizeData, error: sizeError } = await supabase
                .from('file_attachments')
                .select('file_size');

            if (countError || sizeError) {
                throw new Error('Failed to get upload statistics');
            }

            const totalSize = sizeData.reduce((sum, file) => sum + (file.file_size || 0), 0);

            return {
                success: true,
                data: {
                    totalFiles: totalFiles || 0,
                    totalSize: totalSize,
                    totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error in getUploadStatistics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('No file provided');
            return { valid: false, errors };
        }

        if (file.size > this.maxFileSize) {
            errors.push(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            errors.push(`File type ${file.mimetype} is not allowed`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = new FileUploadService();
