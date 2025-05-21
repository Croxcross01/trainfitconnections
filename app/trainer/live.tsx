import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Share2, Users, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { LinearGradient } from 'expo-linear-gradient';

export default function LiveStreamScreen() {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [viewerCount, setViewerCount] = useState(124);
  const [comments, setComments] = useState([
    { id: 1, user: 'Sarah J.', text: 'Great form on those squats!', time: '2m ago' },
    { id: 2, user: 'Mike T.', text: "What's the best way to modify this for beginners?", time: '1m ago' },
    { id: 3, user: 'Jessica R.', text: '🔥🔥🔥', time: 'Just now' },
  ]);
  const [commentText, setCommentText] = useState('');

  // Placeholder image for the live stream (instead of camera)
  const placeholderImage = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      // Increment likes
    }
  };

  const handleShare = () => {
    // Share functionality
  };

  const sendComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        user: 'You',
        text: commentText,
        time: 'Just now',
      };
      setComments([...comments, newComment]);
      setCommentText('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      {/* Live Stream View (Placeholder Image) */}
      <View style={styles.streamContainer}>
        <Image 
          source={{ uri: placeholderImage }} 
          style={styles.streamImage}
          resizeMode="cover"
        />
        
        {/* Overlay for controls and info */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={Colors.text.primary} size={24} />
            </TouchableOpacity>
            
            <View style={styles.liveIndicator}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            
            <View style={styles.viewerCount}>
              <Users color={Colors.text.primary} size={16} />
              <Text style={styles.viewerCountText}>{viewerCount}</Text>
            </View>
          </View>
          
          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <View style={styles.controlButtons}>
              <TouchableOpacity 
                style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
                onPress={toggleMute}
              >
                {isMuted ? (
                  <MicOff color={Colors.text.primary} size={24} />
                ) : (
                  <Mic color={Colors.text.primary} size={24} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, !isVideoOn && styles.controlButtonActive]} 
                onPress={toggleVideo}
              >
                {isVideoOn ? (
                  <Video color={Colors.text.primary} size={24} />
                ) : (
                  <VideoOff color={Colors.text.primary} size={24} />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.interactionButtons}>
              <TouchableOpacity 
                style={styles.interactionButton} 
                onPress={toggleLike}
              >
                <Heart 
                  color={isLiked ? Colors.status.error : Colors.text.primary} 
                  fill={isLiked ? Colors.status.error : 'none'} 
                  size={24} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.interactionButton} 
                onPress={handleShare}
              >
                <Share2 color={Colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      {/* Comments section */}
      <View style={styles.commentsSection}>
        <Text style={[typography.h5, styles.commentsTitle]}>Live Chat</Text>
        
        <ScrollView style={styles.commentsList}>
          {comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentUser}>{comment.user}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.commentTime}>{comment.time}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.commentInputContainer}>
          <TouchableOpacity style={styles.commentInput}>
            <MessageCircle color={Colors.text.secondary} size={20} />
            <Text style={styles.commentInputText}>Type a message...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sendButton} onPress={sendComment}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  streamContainer: {
    height: '60%',
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.background.darker,
  },
  streamImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.primary,
    marginRight: 6,
  },
  liveText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewerCountText: {
    color: Colors.text.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  controlButtons: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  controlButtonActive: {
    backgroundColor: Colors.primary,
  },
  interactionButtons: {
    flexDirection: 'row',
  },
  interactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  commentsSection: {
    flex: 1,
    padding: 16,
  },
  commentsTitle: {
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentUser: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  commentText: {
    ...typography.body,
    color: Colors.text.primary,
    marginTop: 4,
  },
  commentTime: {
    ...typography.tertiarySmall,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.input,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  commentInputText: {
    ...typography.body,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonText: {
    ...typography.button,
    color: Colors.text.primary,
  },
});