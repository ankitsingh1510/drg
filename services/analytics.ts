import * as Device from 'expo-device';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

const isFirebaseEnabled = process.env.EXPO_PUBLIC_ENABLE_FIREBASE === 'true' || false;

/**
 * Centralized Analytics Service
 * Provides methods for event tracking, screen tracking, user identification, and error logging
 */
class AnalyticsService {
  private isEnabled: boolean;
  private currentScreen: string | null = null;

  constructor() {
    this.isEnabled = isFirebaseEnabled && Device.isDevice;
    if (!this.isEnabled) {
      console.log('Analytics disabled (Firebase disabled or running on emulator)');
    }
  }

  /**
   * Initialize analytics (should be called on app start)
   */
  async initialize(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Set analytics collection enabled
      await analytics().setAnalyticsCollectionEnabled(true);

      // Enable crashlytics
      await crashlytics().setCrashlyticsCollectionEnabled(true);

      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  /**
   * Log a custom event
   * @param eventName - Name of the event (use snake_case)
   * @param params - Event parameters (optional)
   */
  async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Add current screen context if available
      const eventParams = {
        ...params,
        screen_name: this.currentScreen || 'unknown',
        timestamp: new Date().toISOString(),
      };

      await analytics().logEvent(eventName, eventParams);
      console.log(`📊 Event logged: ${eventName}`, eventParams);
    } catch (error) {
      console.error('Error logging event:', error);
      // Don't throw - analytics should never break the app
    }
  }

  /**
   * Log screen view
   * @param screenName - Name of the screen
   * @param screenClass - Class/component name (optional)
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      this.currentScreen = screenName;

      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });

      console.log(`📱 Screen view logged: ${screenName}`);
    } catch (error) {
      console.error('Error logging screen view:', error);
    }
  }

  /**
   * Set user identification
   * @param userId - User ID
   * @param username - Username (primary identifier)
   */
  async setUser(userId: string, username: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Set user ID for analytics
      await analytics().setUserId(JSON.stringify(userId));

      // Set username as user property
      await analytics().setUserProperty('username', username);

      // Set user for crashlytics
      console.log(`Setting user for analytics: ${username} (${userId})`);
      await crashlytics().setUserId(JSON.stringify(userId));
      await crashlytics().setAttribute('username', username);

      console.log(`👤 User identified: ${username} (${userId})`);
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }

  /**
   * Set user properties
   * @param properties - Key-value pairs of user properties
   */
  async setUserProperties(properties: Record<string, string>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Set properties in analytics'
      console.log('Setting user properties:', properties);
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }

      // Set properties in crashlytics as attributes
      for (const [key, value] of Object.entries(properties)) {
        await crashlytics().setAttribute(key, value);
      }

      console.log('📋 User properties set:', properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  /**
   * Set environment as user property
   * @param baseUrl - The BASE_URL from environment variables
   */
  async setEnvironment(baseUrl: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Determine environment from BASE_URL
      let environment = 'unknown';
      if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        environment = 'local';
      } else if (baseUrl.includes('dev')) {
        environment = 'development';
      } else if (baseUrl.includes('staging') || baseUrl.includes('stage')) {
        environment = 'staging';
      } else if (baseUrl.includes('prod')) {
        environment = 'production';
      }

      await this.setUserProperties({
        environment,
        base_url: baseUrl,
      });

      console.log(`🌍 Environment set: ${environment} (${baseUrl})`);
    } catch (error) {
      console.error('Error setting environment:', error);
    }
  }

  /**
   * Clear user data (on logout)
   */
  async clearUser(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await analytics().setUserId(null);
      await analytics().resetAnalyticsData();
      await crashlytics().setUserId('');

      console.log('👋 User data cleared');
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  }

  /**
   * Log an error with context
   * @param error - Error object or message
   * @param context - Additional context about the error
   */
  async logError(
    error: Error | string,
    context?: {
      screen?: string;
      action?: string;
      username?: string;
      environment?: string;
      [key: string]: any;
    }
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorDetails = {
        screen_name: context?.screen || this.currentScreen || 'unknown',
        action: context?.action || 'unknown',
        username: context?.username || 'anonymous',
        environment: context?.environment || 'unknown',
        error_type: 'runtime_error',
        timestamp: new Date().toISOString(),
        ...context,
      };

      // Log to crashlytics
      if (typeof error === 'object' && error instanceof Error) {
        await crashlytics().recordError(error);
      } else {
        // Create a custom error for string messages
        await crashlytics().recordError(new Error(errorMessage));
      }

      // Set error context attributes
      for (const [key, value] of Object.entries(errorDetails)) {
        if (value !== undefined && value !== null) {
          await crashlytics().setAttribute(key, String(value));
        }
      }

      // Also log as analytics event
      await this.logEvent('error_occurred', {
        error_message: errorMessage,
        ...errorDetails,
      });

      console.error('❌ Error logged:', errorMessage, errorDetails);
    } catch (logError) {
      console.error('Error logging error:', logError);
    }
  }

  /**
   * Log API error with endpoint and status code
   * @param endpoint - API endpoint that failed
   * @param statusCode - HTTP status code
   * @param error - Error message or object
   * @param context - Additional context
   */
  async logApiError(endpoint: string, statusCode: number, error: any, context?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'API request failed';

      await this.logEvent('api_error', {
        endpoint,
        status_code: statusCode,
        error_message: errorMessage,
        error_type: 'api_error',
        ...context,
      });

      // Also record in crashlytics
      await crashlytics().setAttribute('last_api_error', endpoint);
      await crashlytics().setAttribute('last_api_status', String(statusCode));

      console.error(`🌐 API Error logged: ${endpoint} (${statusCode})`, errorMessage);
    } catch (logError) {
      console.error('Error logging API error:', logError);
    }
  }

  /**
   * Log network failure
   * @param context - Context about the network failure
   */
  async logNetworkFailure(context?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.logEvent('network_failure', {
        error_type: 'network_error',
        ...context,
      });

      console.error('📡 Network failure logged:', context);
    } catch (error) {
      console.error('Error logging network failure:', error);
    }
  }

  /**
   * Track user login
   * @param method - Login method (e.g., 'email', 'biometric')
   */
  async trackLogin(method: string = 'email'): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await analytics().logLogin({ method });
      await this.logEvent('user_login', { login_method: method });

      console.log(`🔐 Login tracked: ${method}`);
    } catch (error) {
      console.error('Error tracking login:', error);
    }
  }

  /**
   * Track user logout
   */
  async trackLogout(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.logEvent('user_logout', {});

      console.log('🚪 Logout tracked');
    } catch (error) {
      console.error('Error tracking logout:', error);
    }
  }

  /**
   * Track feature usage
   * @param featureName - Name of the feature
   * @param additionalParams - Additional parameters
   */
  async trackFeatureUsage(featureName: string, additionalParams?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.logEvent('feature_used', {
        feature_name: featureName,
        ...additionalParams,
      });

      console.log(`✨ Feature usage tracked: ${featureName}`);
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }

  /**
   * Track button click
   * @param buttonName - Name/identifier of the button
   * @param context - Additional context
   */
  async trackButtonClick(buttonName: string, context?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.logEvent('button_click', {
        button_name: buttonName,
        ...context,
      });

      console.log(`🔘 Button click tracked: ${buttonName}`);
    } catch (error) {
      console.error('Error tracking button click:', error);
    }
  }

  /**
   * Track form submission
   * @param formName - Name of the form
   * @param success - Whether submission was successful
   */
  async trackFormSubmission(formName: string, success: boolean): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.logEvent('form_submission', {
        form_name: formName,
        success,
      });

      console.log(`📝 Form submission tracked: ${formName} (${success ? 'success' : 'failed'})`);
    } catch (error) {
      console.error('Error tracking form submission:', error);
    }
  }

  /**
   * Set breadcrumb for crash reporting (useful for debugging)
   * @param message - Breadcrumb message
   * @param data - Additional data
   */
  async setBreadcrumb(message: string, data?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await crashlytics().log(message);

      if (data) {
        for (const [key, value] of Object.entries(data)) {
          await crashlytics().setAttribute(key, String(value));
        }
      }
    } catch (error) {
      console.error('Error setting breadcrumb:', error);
    }
  }

  /**
   * Force a crash (for testing crashlytics - DO NOT USE IN PRODUCTION)
   */
  async testCrash(): Promise<void> {
    if (!this.isEnabled) return;
    await crashlytics().crash();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const {
  initialize: initializeAnalytics,
  logEvent,
  logScreenView,
  setUser,
  setUserProperties,
  setEnvironment,
  clearUser,
  logError,
  logApiError,
  logNetworkFailure,
  trackLogin,
  trackLogout,
  trackFeatureUsage,
  trackButtonClick,
  trackFormSubmission,
  setBreadcrumb,
} = analyticsService;

export default analyticsService;
