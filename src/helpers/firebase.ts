import {initializeApp} from 'firebase/app'

export function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyAw_seaU6GKwWe580X-xfj6agLSGM8qrRk",
        authDomain: "vocli-ab84e.firebaseapp.com",
        projectId: "vocli-ab84e",
        storageBucket: "vocli-ab84e.firebasestorage.app",
        messagingSenderId: "548787620052",
        appId: "1:548787620052:web:56be22c8ba245fb9f21341",
        measurementId: "G-59JEFXF7Y9"
    }

    initializeApp(firebaseConfig)
}