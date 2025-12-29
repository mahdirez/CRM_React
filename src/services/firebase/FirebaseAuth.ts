import { getAuth } from 'firebase/auth'
import FirebaseApp from './FirebaseApp'

let FirebaseAuth: ReturnType<typeof getAuth> | null = null

try {
    if (FirebaseApp) {
        FirebaseAuth = getAuth(FirebaseApp)
    }
} catch (error) {
    console.warn('Firebase Auth initialization failed:', error)
}

export default FirebaseAuth
