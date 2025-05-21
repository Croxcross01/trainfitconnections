import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronDown, ChevronUp, HelpCircle, Mail, MessageSquare, FileText, Info, ExternalLink, Send } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "How do I schedule a session with a trainer?",
    answer: "You can schedule a session by going to the Schedule tab and tapping the '+' button in the top right corner. From there, you can select a trainer, date, time, and location for your session."
  },
  {
    question: "How do I view my meal plans?",
    answer: "Your meal plans can be found in the 'Meal Plans' tab. Here you'll see all nutrition plans created by your trainers. Tap on any plan to view detailed information about meals and nutritional content."
  },
  {
    question: "Can I cancel or reschedule a session?",
    answer: "Yes, you can cancel or reschedule a session by going to the Schedule tab, selecting the session you want to modify, and using the options at the bottom of the session details screen. Please note that cancellations may be subject to your trainer's cancellation policy."
  },
  {
    question: "How do trainers create workout plans?",
    answer: "Trainers can create workout plans by going to their Profile tab, selecting 'Workout Plans', and tapping the '+' button. They can then add exercises, sets, reps, and assign the plan to specific clients."
  },
  {
    question: "How do I update my profile information?",
    answer: "You can update your profile by going to the Profile tab and tapping 'Edit Profile'. From there, you can change your name, email, profile picture, and other personal information."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards, PayPal, and Apple Pay. Payment methods can be managed in the Settings section of your Profile tab."
  },
];

const supportCategories = [
  { id: 'account', label: 'Account Issues' },
  { id: 'billing', label: 'Billing & Payments' },
  { id: 'technical', label: 'Technical Support' },
  { id: 'feature', label: 'Feature Request' },
  { id: 'other', label: 'Other' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [supportCategory, setSupportCategory] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };
  
  const handleSendSupport = () => {
    if (!supportCategory) {
      Alert.alert('Missing Information', 'Please select a support category');
      return;
    }
    
    if (!supportMessage.trim()) {
      Alert.alert('Missing Information', 'Please enter a message');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSupportCategory('');
      setSupportMessage('');
      
      Alert.alert(
        'Message Sent',
        'Your support request has been submitted. We\'ll get back to you soon.',
        [{ text: 'OK' }]
      );
    }, 1000);
  };
  
  const openExternalLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    });
  };
  
  return (
    <>
      <Stack.Screen options={{ title: "Help & Support" }} />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <HelpCircle size={32} color={Colors.primary} />
          <Text style={styles.headerTitle}>How can we help you?</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <Card style={styles.faqCard}>
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                {expandedFAQ === index ? (
                  <ChevronUp size={20} color={Colors.text.secondary} />
                ) : (
                  <ChevronDown size={20} color={Colors.text.secondary} />
                )}
              </TouchableOpacity>
              
              {expandedFAQ === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
              
              {index < faqs.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Contact Support</Text>
        
        <Card style={styles.contactCard}>
          <Text style={styles.contactText}>
            Need more help? Send us a message and we'll get back to you as soon as possible.
          </Text>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.inputLabel}>Select Category</Text>
            <View style={styles.categoriesWrapper}>
              {supportCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    supportCategory === category.id && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSupportCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      supportCategory === category.id && styles.selectedCategoryChipText
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={styles.inputLabel}>Your Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your issue or question..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={supportMessage}
              onChangeText={setSupportMessage}
            />
          </View>
          
          <Button
            title="Send Message"
            onPress={handleSendSupport}
            isLoading={isSubmitting}
            icon={<Send size={16} color={Colors.text.inverse} />}
            fullWidth
          />
        </Card>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Help Center</Text>
        
        <Card style={styles.helpCenterCard}>
          <TouchableOpacity 
            style={styles.helpCenterItem}
            onPress={() => openExternalLink('https://trainfit.example.com/docs')}
          >
            <View style={styles.helpCenterIcon}>
              <FileText size={20} color={Colors.primary} />
            </View>
            <View style={styles.helpCenterContent}>
              <Text style={styles.helpCenterTitle}>Documentation</Text>
              <Text style={styles.helpCenterDescription}>
                Browse our comprehensive guides and tutorials
              </Text>
            </View>
            <ExternalLink size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.helpCenterItem}
            onPress={() => openExternalLink('https://trainfit.example.com/videos')}
          >
            <View style={styles.helpCenterIcon}>
              <MessageSquare size={20} color={Colors.primary} />
            </View>
            <View style={styles.helpCenterContent}>
              <Text style={styles.helpCenterTitle}>Community Forum</Text>
              <Text style={styles.helpCenterDescription}>
                Connect with other users and share experiences
              </Text>
            </View>
            <ExternalLink size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.helpCenterItem}
            onPress={() => Linking.openURL('mailto:support@trainfit.example.com')}
          >
            <View style={styles.helpCenterIcon}>
              <Mail size={20} color={Colors.primary} />
            </View>
            <View style={styles.helpCenterContent}>
              <Text style={styles.helpCenterTitle}>Email Support</Text>
              <Text style={styles.helpCenterDescription}>
                Email us directly at support@trainfit.example.com
              </Text>
            </View>
            <ExternalLink size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        </Card>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>App Information</Text>
        
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>TrainFit v1.0.0</Text>
          </View>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.appInfoItem}
            onPress={() => openExternalLink('https://trainfit.example.com/terms')}
          >
            <Text style={styles.appInfoLabel}>Terms of Service</Text>
            <ExternalLink size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.appInfoItem}
            onPress={() => openExternalLink('https://trainfit.example.com/privacy')}
          >
            <Text style={styles.appInfoLabel}>Privacy Policy</Text>
            <ExternalLink size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.appInfoItem}
            onPress={() => openExternalLink('https://trainfit.example.com/licenses')}
          >
            <Text style={styles.appInfoLabel}>Licenses</Text>
            <ExternalLink size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  faqCard: {
    padding: 0,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: Colors.background.dark,
  },
  faqAnswerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
  },
  contactCard: {
    padding: 16,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: Colors.background.dark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  selectedCategoryChipText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: Colors.background.dark,
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 120,
  },
  helpCenterCard: {
    padding: 0,
    overflow: 'hidden',
  },
  helpCenterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  helpCenterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpCenterContent: {
    flex: 1,
  },
  helpCenterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  helpCenterDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  appInfoCard: {
    padding: 0,
    overflow: 'hidden',
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  appInfoLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  appInfoValue: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});