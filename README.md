# Shake Tree - Telegram Mini App

A fun and interactive game where users shake their device to make fruits fall from a tree and collect them for points!

## Features

- **Shake Detection**: Uses device motion sensors to detect shaking
- **Interactive Gameplay**: Shake to make fruits fall, tap to collect them
- **Score Tracking**: Keeps track of your score with Telegram Cloud Storage
- **Haptic Feedback**: Vibration and Telegram haptic feedback for immersive experience
- **Responsive Design**: Works on all mobile devices
- **Telegram Integration**: Full integration with Telegram Mini Apps SDK
  - Theme color adaptation
  - Cloud storage for high scores
  - Share score functionality
  - Haptic feedback

## How to Play

1. Open the app in Telegram
2. Shake your device to make fruits fall from the tree
3. Tap the falling fruits to collect them before they disappear
4. Each fruit gives you 10 points
5. Try to get the highest score possible!

## File Structure

```
shake-tree-app/
├── index.html      # Main HTML structure
├── styles.css      # Styling and animations
├── app.js          # Game logic and Telegram integration
└── README.md       # This file
```

## Deployment

### Option 1: GitHub Pages

1. Create a new GitHub repository
2. Push these files to the repository
3. Go to Settings > Pages
4. Select main branch as source
5. Your app will be available at `https://yourusername.github.io/shake-tree-app/`

### Option 2: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Your app will be deployed and you'll get a URL

### Option 3: Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run `netlify deploy` in the project directory
3. Follow the prompts
4. Your app will be deployed

## Setting up the Telegram Bot

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Set up Mini App with `/newapp`
4. Choose your bot
5. Provide the deployment URL
6. Set a short name for your app
7. Upload an icon (optional)

## Testing Locally

Since Telegram Mini Apps require HTTPS, you can:

1. Use a local tunnel service like ngrok:
   ```bash
   npx ngrok http 8000
   ```

2. Serve your files:
   ```bash
   python3 -m http.server 8000
   ```

3. Use the ngrok HTTPS URL in BotFather

## Browser Compatibility

- Works best on mobile devices
- Requires device motion API support
- Fallback: Click the tree if shake detection is not available

## Technologies Used

- HTML5
- CSS3 (with animations)
- Vanilla JavaScript
- Telegram Web App SDK
- Device Motion API

## Future Enhancements

- Multiple levels with different trees
- Power-ups and special fruits
- Leaderboard integration
- Daily challenges
- Sound effects
- Different seasons/themes

## License

MIT License - Feel free to use and modify!
