import { initializeApp, getApps, type FirebaseApp as FirebaseAppType } from 'firebase/app'
import firebaseConfig from '@/configs/firebase.config'

let FirebaseApp: FirebaseAppType | null = null

try {
    // Check if Firebase is already initialized
    const apps = getApps()
    if (apps.length === 0) {
        // Only initialize if API key exists
        if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
            FirebaseApp = initializeApp(firebaseConfig)
        } else {
            console.warn('Firebase API key is not configured. Firebase features will be disabled.')
        }
    } else {
        FirebaseApp = apps[0]
    }
} catch (error) {
    console.warn('Firebase initialization failed:', error)
}

export default FirebaseApp
