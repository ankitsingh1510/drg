import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { analyticsService } from '@/services/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches React errors and logs them to Firebase Crashlytics
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to analytics service
    try {
      await analyticsService.logError(error, {
        screen: 'ErrorBoundary',
        action: 'component_error',
        error_type: 'react_error',
        component_stack: errorInfo.componentStack,
      });

      // Set breadcrumb for debugging
      await analyticsService.setBreadcrumb('React Error Boundary caught error', {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 200),
      });
    } catch (loggingError) {
      console.error('Failed to log error to analytics:', loggingError);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.handleReset();
    router.replace('/landing' as any);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 justify-center bg-white p-6 dark:bg-gray-900">
          <View className="mb-4 rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <Text className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400">Oops! Something went wrong</Text>
            <Text className="mb-4 text-base text-gray-700 dark:text-gray-300">
              We've encountered an unexpected error. Don't worry, we've logged it and will fix it soon.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView className="mb-4 max-h-60 rounded bg-gray-100 p-3 dark:bg-gray-800">
                <Text className="mb-2 font-mono text-xs text-gray-800 dark:text-gray-200">
                  {this.state.error.toString()}
                </Text>
                {this.state.error.stack && (
                  <Text className="font-mono text-xs text-gray-600 dark:text-gray-400">{this.state.error.stack}</Text>
                )}
              </ScrollView>
            )}
          </View>

          <View className="space-y-3">
            <TouchableOpacity
              className="items-center rounded-lg bg-blue-600 px-6 py-4"
              onPress={this.handleReset}
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-white">Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-lg bg-gray-200 px-6 py-4 dark:bg-gray-700"
              onPress={this.handleGoHome}
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">Go to Home</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <Text className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              This detailed error message is only visible in development mode
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
