# Sound to beats generator

A web application for capturing and visualizing rhythm in real-time using the browser's microphone.

## Features

- Real-time audio capture from microphone
- Live waveform visualization using Wavesurfer.js
- Clean, responsive user interface
- Error handling for microphone permissions and device issues

## Tech Stack

- **React** with **TypeScript**
- **Vite** as build tool
- **Web Audio API** for audio capture
- **Wavesurfer.js** for waveform visualization

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Click "Start Listening" to begin recording
2. Allow microphone access when prompted
3. Speak, tap, or make sounds to see the live waveform
4. Click "Stop Listening" to stop recording

## Browser Compatibility

This application works best in:
- Chrome (recommended)
- Edge
- Other modern browsers with Web Audio API support

**Note**: Microphone access requires HTTPS in production. For local development, `localhost` is treated as secure.

## Project Structure

```
src/
├── components/
│   ├── AudioRecorder.tsx    # Main recording component
│   ├── AudioRecorder.css
│   ├── WaveformView.tsx     # Waveform visualization component
│   └── WaveformView.css
├── services/
│   └── audioService.ts      # Web Audio API service
├── App.tsx                  # Root component
├── App.css
├── main.tsx                 # Application entry point
└── index.css                # Global styles
```

## License

MIT
