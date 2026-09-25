/**
 * Instagram Service
 * 
 * Future Meta Graph API Publishing Interface:
 * When direct Instagram publishing is configured, this service handles:
 * 1. Uploading the rendered image to a public CDN/Storage
 * 2. Creating a media container via POST https://graph.facebook.com/v21.0/{ig-user-id}/media
 * 3. Publishing the container via POST https://graph.facebook.com/v21.0/{ig-user-id}/media_publish
 */

export interface DirectPublishOptions {
  imageUrl: string;
  caption: string;
}

export interface PublishResult {
  success: boolean;
  instagramMediaId?: string;
  error?: string;
  isMock?: boolean;
}

export class InstagramService {
  private igUserId?: string;
  private accessToken?: string;

  constructor() {
    this.igUserId = process.env.INSTAGRAM_USER_ID;
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  public isDirectPublishingConfigured(): boolean {
    return Boolean(this.igUserId && this.accessToken);
  }

  public async publishPost(options: DirectPublishOptions): Promise<PublishResult> {
    if (!this.isDirectPublishingConfigured()) {
      return {
        success: false,
        error: 'Direct Instagram Graph API credentials are not configured in environment variables. Please use manual download & publish workflow.',
        isMock: true,
      };
    }

    try {
      // Step 1: Create IG Media Container
      const containerRes = await fetch(
        `https://graph.facebook.com/v21.0/${this.igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: options.imageUrl,
            caption: options.caption,
            access_token: this.accessToken,
          }),
        }
      );

      const containerData = (await containerRes.json()) as { id?: string; error?: any };
      if (!containerData.id) {
        return {
          success: false,
          error: containerData.error?.message || 'Failed to create Instagram media container.',
        };
      }

      // Step 2: Publish Container
      const publishRes = await fetch(
        `https://graph.facebook.com/v21.0/${this.igUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: this.accessToken,
          }),
        }
      );

      const publishData = (await publishRes.json()) as { id?: string; error?: any };
      if (!publishData.id) {
        return {
          success: false,
          error: publishData.error?.message || 'Failed to publish media container.',
        };
      }

      return {
        success: true,
        instagramMediaId: publishData.id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error communicating with Meta Graph API.',
      };
    }
  }
}

export const instagramService = new InstagramService();
