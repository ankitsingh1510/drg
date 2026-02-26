import { apiFetch } from './fetchClient';

interface SignedUrlResponse {
  signed_url: string;
}

export const elevenLabsAPI = {
  /**
   * Get a signed WebSocket URL for conversational AI
   */
  getSignedUrl: async (): Promise<string> => {
    try {
      const response = await apiFetch(
        `${process.env.EXPO_PUBLIC_AMPLIFY_URL}/drg/api/auth/elevenlabs/?agent_id=${process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID}`,
        {
          method: 'POST',
        }
      );

      const data = response.data as SignedUrlResponse;
      return data.signed_url;
    } catch (error) {
      console.error('Error getting ElevenLabs signed URL:', error);
      throw error;
    }
  },
};
