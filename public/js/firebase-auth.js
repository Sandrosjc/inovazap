import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuUzi3RkYU6nvHQTsQ_IEUZNgbTF5lXqw",
  authDomain: "inova-zap.firebaseapp.com",
  projectId: "inova-zap",
  storageBucket: "inova-zap.firebasestorage.app",
  messagingSenderId: "340003176058",
  appId: "1:340003176058:web:386fed1e74c5d4a0fd05c3",
  measurementId: "G-L6LNM8TNSR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const userBox = document.getElementById('userBox');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');

btnLogin.addEventListener('click', () => {
  signInWithPopup(auth, provider).catch((err) => {
    alert('Erro ao entrar: ' + err.message);
  });
});

btnLogout.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    btnLogin.style.display = 'none';
    userBox.style.display = 'flex';
    userPhoto.src = user.photoURL || '';
    userName.textContent = user.displayName || user.email;
    console.log('Usuario logado:', user.email);
  } else {
    btnLogin.style.display = 'inline-block';
    userBox.style.display = 'none';
    console.log('Nenhum usuario logado');
  }
});
