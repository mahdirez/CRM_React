import { getFirestore } from 'firebase/firestore'
import FirebaseApp from './FirebaseApp'

let FirebaseDB: ReturnType<typeof getFirestore> | null = null

try {
    if (FirebaseApp) {
        FirebaseDB = getFirestore(FirebaseApp)
    }
} catch (error) {
    console.warn('Firebase Firestore initialization failed:', error)
}

export default FirebaseDB
