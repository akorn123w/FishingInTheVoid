import { Howl } from 'howler';

class AudioManager {
    private sounds: { [key: string]: Howl } = {};

    // Load a sound file
    loadSound(key: string, src: string): void {
        this.sounds[key] = new Howl({
            src: [src],
            autoplay: false,
            loop: false,
            volume: 1.0,
        });
    }

    // Play a loaded sound
    play(key: string): void {
        const sound = this.sounds[key];
        if (sound) {
            sound.play();
        } else {
            console.warn(`Sound "${key}" not found`);
        }
    }

    // Stop a playing sound
    stop(key: string): void {
        const sound = this.sounds[key];
        if (sound) {
            sound.stop();
        }
    }

    // Set volume for a specific sound (0.0 to 1.0)
    setVolume(key: string, volume: number): void {
        const sound = this.sounds[key];
        if (sound) {
            sound.volume(volume);
        }
    }

    // Set loop for a specific sound
    setLoop(key: string, loop: boolean): void {
        const sound = this.sounds[key];
        if (sound) {
            sound.loop(loop);
        }
    }
}

// Create a singleton instance
const audioManager = new AudioManager();
export default audioManager;