# BetterKaraoke 🎤

A competitive karaoke app built with React Native and Expo that lets you sing solo or compete with friends in real-time multiplayer versus mode!

## 🚀 Features

### Solo Mode

- **Song Library**: Choose from a curated list of songs already available in the app
- **Custom Song Upload**: Import your favorite tracks and create personalized karaoke sessions
- **Real-time Lyrics**: Synchronized lyrics that follow along with the music
- **Voice Recording**: Record your performance and save it to your media library
- **Performance Analysis**: Get feedback on your singing accuracy

### Multiplayer Versus Mode 🏆

- **Real-time Competition**: Up to 4 players can compete simultaneously
- **Live Scoring**: Real-time pitch and timing accuracy analysis
- **Room System**: Create or join rooms with unique 6-character codes
- **Performance Tracking**: Live performance bars showing pitch and timing accuracy
- **Competitive Rankings**: Final results with medals and trophies
- **Play Again**: Quick rematch functionality

## 🎵 Song Library

### Built-in Songs

Start with these popular hits:

- **Uptown Funk** - Bruno Mars
- **One Dance** - Drake
- **Perfect** - Ed Sheeran
- **Baby** - Justin Bieber
- **All I Want for Christmas is You** - Mariah Carey
- **Billie Jean** - Michael Jackson
- **Die for You** - The Weeknd
- **SICKO MODE** - Travis Scott

### Upload Your Own

- **MP3 Support**: Import any MP3 file from your device
- **Personal Library**: Build your own collection of favorite songs
- **Custom Lyrics**: Add synchronized lyrics for your uploaded tracks
- **Unlimited Storage**: No restrictions on the number of songs you can add

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Audio**: Expo AV for audio playback and recording
- **UI**: Custom themed components with dark/light mode support
- **Navigation**: Expo Router for seamless navigation
- **Styling**: React Native StyleSheet with LinearGradient effects
- **Icons**: SF Symbols for consistent iconography

## 📱 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd BetterKaraoke
   ```

2. **Install dependencies**

   ```bash
   cd better-karaoke
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 🎮 How to Play

### Solo Mode

1. Navigate to "Start Singing" from the home screen
2. Choose from built-in songs or upload your own MP3 files
3. For custom songs, add synchronized lyrics for the best experience
4. Select "Record & Play" to capture your performance
5. Sing along with the synchronized lyrics
6. Your recording will be saved automatically

### Multiplayer Versus Mode

1. Tap "Multiplayer" from the home screen
2. Enter your name and either:
   - **Create Room**: Generate a new room and share the code with friends
   - **Join Room**: Enter an existing room code
3. Wait for all players to join and get ready
4. The host starts the game when everyone is ready
5. All players sing the same song simultaneously
6. Real-time scoring based on pitch and timing accuracy
7. View final rankings and performance statistics
8. Play again or start a new room

## 🏗️ Project Structure

```
better-karaoke/
├── app/                    # Main app screens
│   ├── index.tsx          # Home screen
│   ├── songs.tsx          # Song selection screen
│   ├── multiplayer.tsx    # Multiplayer lobby and game
│   └── _layout.tsx        # App navigation layout
├── components/             # Reusable components
│   ├── MultiplayerRoom.tsx        # Multiplayer lobby
│   ├── MultiplayerVersusGame.tsx # Versus game screen
│   ├── GameResults.tsx           # Game results display
│   └── LyricsPlaybackControls.tsx # Solo mode controls
├── assets/                 # Audio, lyrics, and images
│   ├── audio/             # MP3 song files
│   ├── lyrics/            # JSON lyric files
│   └── images/            # App icons and images
├── constants/              # App constants and colors
├── hooks/                  # Custom React hooks
└── utils/                  # Utility functions
```

## 🎯 Multiplayer Game Mechanics

### Scoring System

- **Pitch Accuracy (60%)**: How well you match the song's melody
- **Timing Accuracy (40%)**: How well you sync with the beat
- **Real-time Updates**: Scores update every 500ms during gameplay

### Game Flow

1. **Countdown**: 3-second countdown before singing begins
2. **Performance**: All players sing simultaneously with live feedback
3. **Results**: Final rankings with detailed performance breakdown
4. **Rematch**: Quick option to play again with the same players

### Room Management

- **Room Codes**: 6-character alphanumeric codes (e.g., "ABC123")
- **Player Limits**: Maximum 4 players per room
- **Host Controls**: Only the host can start the game
- **Ready System**: Players must mark themselves as ready

## 🔧 Development

### Adding New Songs

1. **Built-in Songs**: Add MP3 file to `assets/audio/` and create corresponding JSON lyric file in `assets/lyrics/`
2. **User Uploads**: Users can import MP3 files directly from their device storage
3. **Custom Lyrics**: Users can add synchronized lyrics for their uploaded songs
4. **Library Management**: Automatic organization of user-uploaded songs in personal library
5. **Update Songs Array**: Modify the `SONGS` array in `app/songs.tsx` for built-in additions

### Customizing Themes

- Modify `constants/Colors.ts` for new color schemes
- Update component styles to use theme colors
- Support for both light and dark modes

### Audio Processing

- Uses Expo AV for audio playback and recording
- Automatic mixing of background music with user vocals
- Support for various audio formats

## 🚀 Deployment

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

### Publishing Updates

```bash
expo publish
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for the robust mobile framework
- **Music Artists** for the incredible songs
- **Open Source Community** for the various libraries and tools

## 📞 Support

If you encounter any issues or have questions:

- Check the [Expo documentation](https://docs.expo.dev/)
- Review React Native troubleshooting guides
- Open an issue in this repository

---

**Ready to become a karaoke champion?** 🎤✨

Start singing solo or challenge your friends in multiplayer versus mode. May the best singer win! 🏆
