import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export async function mixAudioTracks(
  musicUri: string,
  voiceUri: string,
  outputFileName: string
): Promise<string> {
  // Create a temporary file for the mixed audio
  const outputUri = `${FileSystem.documentDirectory}${outputFileName}.m4a`;
  
  // In a real implementation, you would use a native module to mix the audio
  // This is a simplified version that just returns the voice recording
  // For a real implementation, you would need to use a native audio mixing library
  
  // For now, we'll just save the voice recording as is
  await FileSystem.copyAsync({
    from: voiceUri,
    to: outputUri,
  });

  // Save to media library
  const asset = await MediaLibrary.createAssetAsync(outputUri);
  await MediaLibrary.createAlbumAsync('BetterKaraoke', asset, false);
  
  return outputUri;
}

export async function startRecording(): Promise<Audio.Recording> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return newRecording;
  } catch (err) {
    console.error('Failed to start recording', err);
    throw err;
  }
}

export async function stopRecording(recording: Audio.Recording | null): Promise<string> {
  if (!recording) {
    throw new Error('No active recording');
  }
  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    if (!uri) {
      throw new Error('Recording URI is null');
    }
    
    return uri;
  } catch (err) {
    console.error('Failed to stop recording', err);
    throw err;
  }
}
