import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Moon, Globe, Lock, Shield, HelpCircle, Info, Smartphone } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    location: true,
    biometricLogin: false,
    twoFactorAuth: false,
  });
  
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleResetPassword = () => {
    Alert.alert(
      "Reset Password",
      "Are you sure you want to reset your password?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: () => {
            // In a real app, this would trigger a password reset flow
            Alert.alert("Password Reset", "Password reset instructions have been sent to your email.");
          }
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // In a real app, this would trigger account deletion
            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
            router.replace('/(auth)');
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView style={[layout.screen, styles.container]} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      
      <Card style={styles.settingsCard} variant="elevated">
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Bell size={20} color={Colors.status.error} />
            </View>
            <Text style={styles.settingTitle}>Notifications</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={() => toggleSetting('notifications')}
            trackColor={{ false: Colors.text.tertiary, true: Colors.primaryLight }}
            thumbColor={settings.notifications ? Colors.primary : Colors.text.secondary}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
              <Moon size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingTitle}>Dark Mode</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={() => toggleSetting('darkMode')}
            trackColor={{ false: Colors.text.tertiary, true: Colors.primaryLight }}
            thumbColor={settings.darkMode ? Colors.primary : Colors.text.secondary}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Globe size={20} color={Colors.primaryLight} />
            </View>
            <Text style={styles.settingTitle}>Location Services</Text>
          </View>
          <Switch
            value={settings.location}
            onValueChange={() => toggleSetting('location')}
            trackColor={{ false: Colors.text.tertiary, true: Colors.primaryLight }}
            thumbColor={settings.location ? Colors.primary : Colors.text.secondary}
          />
        </View>
      </Card>
      
      <Text style={styles.sectionTitle}>Security</Text>
      
      <Card style={styles.settingsCard} variant="elevated">
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
              <Smartphone size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingTitle}>Biometric Login</Text>
          </View>
          <Switch
            value={settings.biometricLogin}
            onValueChange={() => toggleSetting('biometricLogin')}
            trackColor={{ false: Colors.text.tertiary, true: Colors.primaryLight }}
            thumbColor={settings.biometricLogin ? Colors.primary : Colors.text.secondary}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Shield size={20} color={Colors.primaryLight} />
            </View>
            <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
          </View>
          <Switch
            value={settings.twoFactorAuth}
            onValueChange={() => toggleSetting('twoFactorAuth')}
            trackColor={{ false: Colors.text.tertiary, true: Colors.primaryLight }}
            thumbColor={settings.twoFactorAuth ? Colors.primary : Colors.text.secondary}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Lock size={20} color={Colors.status.error} />
            </View>
            <Text style={styles.settingTitle}>Reset Password</Text>
          </View>
          <Button 
            title="Reset" 
            onPress={handleResetPassword}
            variant="outline"
            size="small"
          />
        </View>
      </Card>
      
      <Text style={styles.sectionTitle}>About</Text>
      
      <Card style={styles.settingsCard} variant="elevated">
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingTitle}>Help & Support</Text>
          </View>
          <Button 
            title="View" 
            onPress={() => router.push('/help-support')}
            variant="outline"
            size="small"
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Info size={20} color={Colors.primaryLight} />
            </View>
            <Text style={styles.settingTitle}>About TrainFit</Text>
          </View>
          <Button 
            title="View" 
            onPress={() => Alert.alert("About TrainFit", "TrainFit v1.0.0\n\nA fitness platform connecting trainers and clients for personalized workout and nutrition plans.")}
            variant="outline"
            size="small"
          />
        </View>
      </Card>
      
      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
        <Button 
          title="Delete Account" 
          onPress={handleDeleteAccount}
          variant="destructive"
          fullWidth
        />
      </View>
      
      <Text style={styles.versionText}>TrainFit v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  settingsCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: 16,
  },
  dangerZone: {
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  dangerZoneTitle: {
    ...typography.h5,
    color: Colors.status.error,
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    color: Colors.text.tertiary,
    fontSize: 12,
    marginBottom: 16,
  },
});