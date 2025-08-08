// File upload API for payment slips
// Uses Supabase Storage for file uploads

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Supabase storage not configured',
        error: 'Missing environment variables'
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get file data from request
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fileData, fileName, fileType'
      });
    }

    // Validate file data (base64 encoded)
    if (!fileData.startsWith('data:')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file data format. Must be base64 encoded with data URI scheme.'
      });
    }

    // Extract base64 data
    const base64Data = fileData.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 data'
      });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique file name
    const uniqueFileName = `${uuidv4()}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-slips')
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error.message
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment-slips')
      .getPublicUrl(uniqueFileName);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: uniqueFileName,
        url: urlData.publicUrl,
        type: fileType,
        size: buffer.length
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
}