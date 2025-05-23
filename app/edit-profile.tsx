import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, Alert, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Colors from "@/constants/colors";
import { typography } from "@/styles/typography";
import { layout } from "@/styles/layout";
import { Camera, X, Instagram, Twitter, Facebook, Linkedin, Globe, MapPin, ChevronDown, ChevronUp, Upload } from "lucide-react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [specialties, setSpecialties] = useState(user?.specialties?.join(", ") || "");
  const [experience, setExperience] = useState(user?.experience || "");
  const [rateType, setRateType] = useState(user?.rateType || "hourly");
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate?.toString() || "");
  const [customRates, setCustomRates] = useState(user?.customRates || []);
  const [newRateTitle, setNewRateTitle] = useState("");
  const [newRateAmount, setNewRateAmount] = useState("");
  const [certifications, setCertifications] = useState(user?.certifications?.join(", ") || "");
  const [location, setLocation] = useState(user?.location?.address || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [imageUploading, setImageUploading] = useState(false);
  
  // Social media links
  const [instagram, setInstagram] = useState(user?.socialLinks?.instagram || "");
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || "");
  const [facebook, setFacebook] = useState(user?.socialLinks?.facebook || "");
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || "");
  const [website, setWebsite] = useState(user?.socialLinks?.website || "");
  
  // Availability
  const [availableDays, setAvailableDays] = useState<string[]>(user?.availability?.days || []);
  const [startTime, setStartTime] = useState(user?.availability?.hours?.start || "09:00");
  const [endTime, setEndTime] = useState(user?.availability?.hours?.end || "17:00");
  
  // UI state
  const [showRateOptions, setShowRateOptions] = useState(false);
  
  const isTrainer = user?.role === "trainer";
  
  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images!');
        }
      }
    })();
  }, []);
  
  const pickImage = async () => {
    try {
      setImageUploading(true);
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Reduced quality to decrease file size
        exif: false, // Don't include EXIF data to reduce size
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Check file size (limit to 2MB)
        const fileSize = selectedAsset.fileSize || 0;
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (fileSize > maxSize) {
          Alert.alert(
            "File Too Large", 
            `The selected image is ${(fileSize / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 2MB. Please select a smaller image or compress this one.`
          );
          return;
        }
        
        // Set the selected image URI as the profile image
        setProfileImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };
  
  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };
  
  const addCustomRate = () => {
    if (!newRateTitle.trim() || !newRateAmount.trim()) {
      Alert.alert("Error", "Please enter both a title and amount for the custom rate");
      return;
    }
    
    const amount = parseFloat(newRateAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid rate amount");
      return;
    }
    
    // Limit the number of custom rates to 5
    if (customRates.length >= 5) {
      Alert.alert("Limit Reached", "You can add a maximum of 5 custom rates.");
      return;
    }
    
    const newRate = {
      id: Date.now().toString(),
      title: newRateTitle.trim(),
      amount: amount
    };
    
    setCustomRates([...customRates, newRate]);
    setNewRateTitle("");
    setNewRateAmount("");
  };
  
  const removeCustomRate = (id: string) => {
    setCustomRates(customRates.filter(rate => rate.id !== id));
  };
  
  const handleSave = async () => {
    try {
      // Validate bio length
      if (bio.length > 500) {
        Alert.alert("Error", "Bio is too long. Maximum 500 characters allowed.");
        return;
      }
      
      // Create a location object that matches the User type
      const locationData = user?.location ? {
        ...user.location,
        address: location
      } : {
        latitude: 0, // Default value to satisfy the type
        longitude: 0, // Default value to satisfy the type
        address: location
      };
      
      const userData = {
        name,
        bio,
        profileImage,
        location: locationData
      };
      
      if (isTrainer) {
        // Limit specialties to 10
        const specialtiesArray = specialties.split(",").map(s => s.trim()).filter(s => s);
        if (specialtiesArray.length > 10) {
          Alert.alert("Error", "You can add a maximum of 10 specialties.");
          return;
        }
        
        // Limit certifications to 10
        const certificationsArray = certifications.split(",").map(s => s.trim()).filter(s => s);
        if (certificationsArray.length > 10) {
          Alert.alert("Error", "You can add a maximum of 10 certifications.");
          return;
        }
        
        Object.assign(userData, {
          specialties: specialtiesArray,
          certifications: certificationsArray,
          experience,
          rateType,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          customRates: rateType === "custom" ? customRates : [],
          socialLinks: {
            instagram,
            twitter,
            facebook,
            linkedin,
            website
          },
          availability: {
            days: availableDays,
            hours: {
              start: startTime,
              end: endTime
            }
          }
        });
      }
      
      // Check payload size before saving
      const payloadSize = new Blob([JSON.stringify(userData)]).size;
      const maxSize = 1 * 1024 * 1024; // 1MB
      
      if (payloadSize > maxSize) {
        Alert.alert(
          "Data Too Large", 
          "The profile data is too large. Please use shorter descriptions and fewer items."
        );
        return;
      }
      
      await updateProfile(userData);
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Check if the error is related to payload size
      if (error instanceof Error && 
          (error.message.includes('payload') || 
           error.message.includes('size') || 
           error.message.includes('large'))) {
        Alert.alert("Error", "The profile data is too large. Please use shorter descriptions and fewer items.");
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    }
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ 
        title: "Edit Profile",
        headerRight: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        ),
      }} />
      
      <View style={styles.profileImageContainer}>
        <Image
          source={{ 
            uri: profileImage || (isTrainer ? 
              'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000' :
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000')
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={pickImage}
          disabled={imageUploading}
        >
          {imageUploading ? (
            <Text style={styles.uploadingText}>...</Text>
          ) : (
            <Camera size={20} color={Colors.text.inverse} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.changePhotoButton}
          onPress={pickImage}
          disabled={imageUploading}
        >
          <Upload size={16} color={Colors.primary} style={styles.uploadIcon} />
          <Text style={styles.changePhotoText}>
            {imageUploading ? "Uploading..." : "Change Photo (max 2MB)"}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          style={styles.input}
          maxLength={50} // Limit name length
        />
        
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          maxLength={500} // Limit bio length
        />
        <Text style={styles.charCount}>{bio.length}/500</Text>
        
        <Text style={styles.label}>Location</Text>
        <View style={styles.locationInputContainer}>
          <MapPin size={20} color={Colors.text.tertiary} style={styles.locationIcon} />
          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="Your location"
            style={styles.locationInput}
            maxLength={100} // Limit location length
          />
        </View>
        
        {isTrainer && (
          <>
            <Text style={styles.sectionTitle}>Professional Details</Text>
            
            <Text style={styles.label}>Specialties (comma separated)</Text>
            <Input
              value={specialties}
              onChangeText={setSpecialties}
              placeholder="e.g. Weight Loss, Strength Training, HIIT"
              style={styles.input}
              maxLength={200} // Limit specialties length
            />
            
            <Text style={styles.label}>Certifications (comma separated)</Text>
            <Input
              value={certifications}
              onChangeText={setCertifications}
              placeholder="e.g. NASM CPT, ACE, ISSA"
              style={styles.input}
              maxLength={200} // Limit certifications length
            />
            
            <Text style={styles.label}>Experience</Text>
            <Input
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g. 5+ years"
              style={styles.input}
              maxLength={50} // Limit experience length
            />
            
            <Text style={styles.label}>Rate Type</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowRateOptions(!showRateOptions)}
            >
              <Text style={styles.dropdownButtonText}>
                {rateType === "hourly" ? "Hourly Rate" : "Custom Rates"}
              </Text>
              {showRateOptions ? 
                <ChevronUp size={20} color={Colors.text.primary} /> : 
                <ChevronDown size={20} color={Colors.text.primary} />
              }
            </TouchableOpacity>
            
            {showRateOptions && (
              <View style={styles.dropdownOptions}>
                <TouchableOpacity 
                  style={[
                    styles.dropdownOption,
                    rateType === "hourly" && styles.selectedOption
                  ]}
                  onPress={() => {
                    setRateType("hourly");
                    setShowRateOptions(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    rateType === "hourly" && styles.selectedOptionText
                  ]}>
                    Hourly Rate
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.dropdownOption,
                    rateType === "custom" && styles.selectedOption
                  ]}
                  onPress={() => {
                    setRateType("custom");
                    setShowRateOptions(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    rateType === "custom" && styles.selectedOptionText
                  ]}>
                    Custom Rates
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {rateType === "hourly" ? (
              <>
                <Text style={styles.label}>Hourly Rate ($)</Text>
                <Input
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="e.g. 60"
                  keyboardType="numeric"
                  style={styles.input}
                  maxLength={10} // Limit hourly rate length
                />
              </>
            ) : (
              <View style={styles.customRatesContainer}>
                <Text style={styles.label}>Custom Rates</Text>
                
                {customRates.map((rate) => (
                  <View key={rate.id} style={styles.customRateItem}>
                    <View style={styles.customRateInfo}>
                      <Text style={styles.customRateTitle}>{rate.title}</Text>
                      <Text style={styles.customRateAmount}>${rate.amount}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeRateButton}
                      onPress={() => removeCustomRate(rate.id)}
                    >
                      <X size={16} color={Colors.status.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <View style={styles.addRateContainer}>
                  <Input
                    value={newRateTitle}
                    onChangeText={setNewRateTitle}
                    placeholder="Rate title (e.g. 10-Session Package)"
                    style={styles.addRateInput}
                    maxLength={50} // Limit rate title length
                  />
                  <Input
                    value={newRateAmount}
                    onChangeText={setNewRateAmount}
                    placeholder="Amount ($)"
                    keyboardType="numeric"
                    style={styles.addRateInput}
                    maxLength={10} // Limit rate amount length
                  />
                  <TouchableOpacity 
                    style={styles.addRateButton}
                    onPress={addCustomRate}
                  >
                    <Text style={styles.addRateButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Availability</Text>
            
            <Text style={styles.label}>Available Days</Text>
            <View style={styles.daysContainer}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    availableDays.includes(day) && styles.selectedDayButton
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      availableDays.includes(day) && styles.selectedDayButtonText
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.timeContainer}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.label}>Start Time</Text>
                <Input
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  style={styles.timeInput}
                  maxLength={5} // Limit time length
                />
              </View>
              
              <View style={styles.timeInputContainer}>
                <Text style={styles.label}>End Time</Text>
                <Input
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="17:00"
                  style={styles.timeInput}
                  maxLength={5} // Limit time length
                />
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Social Media</Text>
            
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.socialInputContainer}>
              <Instagram size={20} color={Colors.text.tertiary} style={styles.socialIcon} />
              <Input
                value={instagram}
                onChangeText={setInstagram}
                placeholder="Your Instagram handle"
                style={styles.socialInput}
                maxLength={50} // Limit social media length
              />
            </View>
            
            <Text style={styles.label}>Twitter</Text>
            <View style={styles.socialInputContainer}>
              <Twitter size={20} color={Colors.text.tertiary} style={styles.socialIcon} />
              <Input
                value={twitter}
                onChangeText={setTwitter}
                placeholder="Your Twitter handle"
                style={styles.socialInput}
                maxLength={50} // Limit social media length
              />
            </View>
            
            <Text style={styles.label}>Facebook</Text>
            <View style={styles.socialInputContainer}>
              <Facebook size={20} color={Colors.text.tertiary} style={styles.socialIcon} />
              <Input
                value={facebook}
                onChangeText={setFacebook}
                placeholder="Your Facebook profile"
                style={styles.socialInput}
                maxLength={50} // Limit social media length
              />
            </View>
            
            <Text style={styles.label}>LinkedIn</Text>
            <View style={styles.socialInputContainer}>
              <Linkedin size={20} color={Colors.text.tertiary} style={styles.socialIcon} />
              <Input
                value={linkedin}
                onChangeText={setLinkedin}
                placeholder="Your LinkedIn profile"
                style={styles.socialInput}
                maxLength={50} // Limit social media length
              />
            </View>
            
            <Text style={styles.label}>Website</Text>
            <View style={styles.socialInputContainer}>
              <Globe size={20} color={Colors.text.tertiary} style={styles.socialIcon} />
              <Input
                value={website}
                onChangeText={setWebsite}
                placeholder="Your website URL"
                style={styles.socialInput}
                maxLength={100} // Limit website length
              />
            </View>
          </>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Save Changes"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background.dark,
  },
  uploadingText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  uploadIcon: {
    marginRight: 8,
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  label: {
    ...typography.label,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 4,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginBottom: 16,
  },
  locationInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  locationInput: {
    flex: 1,
    paddingLeft: 45,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  dropdownOptions: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  selectedOption: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  customRatesContainer: {
    marginBottom: 16,
  },
  customRateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  customRateInfo: {
    flex: 1,
  },
  customRateTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customRateAmount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  removeRateButton: {
    padding: 8,
  },
  addRateContainer: {
    marginTop: 8,
  },
  addRateInput: {
    marginBottom: 8,
  },
  addRateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  addRateButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: '13%',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    marginBottom: 8,
  },
  selectedDayButton: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  selectedDayButtonText: {
    color: Colors.text.inverse,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInputContainer: {
    width: '48%',
  },
  timeInput: {
    marginBottom: 0,
  },
  socialInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  socialIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  socialInput: {
    flex: 1,
    paddingLeft: 45,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});