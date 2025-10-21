
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB7Y75KDgnoYyOEDsYK3lNGrebqRRwYwM",
  authDomain: "tank-water-level-monitor.firebaseapp.com",
  databaseURL: "https://tank-water-level-monitor-default-rtdb.firebaseio.com/",
  projectId: "tank-water-level-monitor",
  storageBucket: "tank-water-level-monitor.appspot.com",
  messagingSenderId: "835911518777",
  appId: "1:835911518777:android:ae072b5866741997f01be8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

export { database };
