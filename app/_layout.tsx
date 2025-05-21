import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar, Platform, Alert } from "react-native";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Create a client with better error handling and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load only FontAwesome font to avoid network errors
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(err => {
        console.warn("Error hiding splash screen:", err);
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.background.dark} />
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { user, isAuthenticated, clearError } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Clear any errors when navigating
  useEffect(() => {
    clearError();
  }, [segments]);

  // Only run this effect after the component has mounted
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page if not authenticated and not already in the auth group
      router.replace("/(auth)");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page if authenticated and still in the auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, router]);

  // Add global error handler for network requests with improved payload size handling
  useEffect(() => {
    const originalFetch = global.fetch;
    
    global.fetch = async (input, init) => {
      try {
        // Check if this is a POST request with a body
        if (init && init.method === 'POST' && init.body) {
          // Get the body size
          const bodySize = init.body instanceof Blob 
            ? init.body.size 
            : typeof init.body === 'string' 
              ? new Blob([init.body]).size 
              : 0;
          
          // If body size is too large (over 8MB), reject the request
          const maxSize = 8 * 1024 * 1024; // 8MB
          if (bodySize > maxSize) {
            console.error(`Request payload too large: ${bodySize} bytes (max: ${maxSize} bytes)`);
            
            // Show an alert to the user
            if (Platform.OS !== 'web') {
              Alert.alert(
                "Error", 
                `Request payload too large: ${(bodySize / (1024 * 1024)).toFixed(2)}MB exceeds limit of 8MB`
              );
            }
            
            throw new Error(`Payload too large: ${(bodySize / (1024 * 1024)).toFixed(2)}MB exceeds limit of 8MB`);
          }
        }
        
        const response = await originalFetch(input, init);
        
        // Check for 413 status code
        if (response.status === 413) {
          console.error('413 Payload Too Large error detected');
          
          // Show an alert to the user
          if (Platform.OS !== 'web') {
            Alert.alert(
              "Error", 
              "Payload too large. Please reduce the size of your request."
            );
          }
          
          throw new Error('Payload too large. Please reduce the size of your request.');
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        
        // Check if the error is related to payload size
        if (error instanceof Error && 
            (error.message.includes('payload') || 
             error.message.includes('size') || 
             error.message.includes('large'))) {
          // Show an alert to the user
          if (Platform.OS !== 'web') {
            Alert.alert("Error", error.message);
          }
        }
        
        throw error;
      }
    };
    
    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: Colors.background.dark,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.background.dark,
        },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trainer/[id]" options={{ title: "Trainer Profile" }} />
      <Stack.Screen name="trainer/video/[id]" options={{ title: "Video" }} />
      <Stack.Screen name="trainer/videos" options={{ title: "Video Library" }} />
      <Stack.Screen name="trainer/photos" options={{ title: "Photo Gallery" }} />
      <Stack.Screen name="trainer/add-photo" options={{ title: "Add New Photo" }} />
      <Stack.Screen name="trainer/edit-photo/[id]" options={{ title: "Edit Photo" }} />
      <Stack.Screen name="trainer/live" options={{ title: "Live Stream" }} />
      <Stack.Screen name="trainer/edit-video/[id]" options={{ title: "Edit Video" }} />
      <Stack.Screen name="trainer-map" options={{ title: "Find Trainers" }} />
      <Stack.Screen name="session/[id]" options={{ title: "Session Details" }} />
      <Stack.Screen name="workout/[id]" options={{ title: "Workout Plan" }} />
      <Stack.Screen name="meal/[id]" options={{ title: "Meal Plan" }} />
      <Stack.Screen name="reminder/[id]" options={{ title: "Notification" }} />
      <Stack.Screen name="book-session" options={{ title: "Book Session" }} />
      <Stack.Screen name="new-session" options={{ title: "Schedule New Session", presentation: "modal" }} />
      <Stack.Screen name="add-client" options={{ title: "Add New Client", presentation: "modal" }} />
      <Stack.Screen name="add-meal-plan" options={{ title: "Create Meal Plan", presentation: "modal" }} />
      <Stack.Screen name="add-workout-plan" options={{ title: "Create Workout Plan", presentation: "modal" }} />
      <Stack.Screen name="help-support" options={{ title: "Help & Support" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
      <Stack.Screen name="billing-history" options={{ title: "Billing History" }} />
      <Stack.Screen name="revenue" options={{ title: "Revenue" }} />
      <Stack.Screen name="messages" options={{ headerShown: false }} />
      <Stack.Screen name="client/[id]" options={{ title: "Client Details" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="edit-client" options={{ title: "Edit Client", presentation: "modal" }} />
    </Stack>
  );
}