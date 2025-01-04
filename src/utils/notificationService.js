import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { v4 as uuidv4 } from 'uuid';

export const requestPermissionAndGetToken = async () => {
  console.log("Requesting notification permission...");
  try {
    const permission = await Notification.requestPermission();
    // console.log("Notification permission status:", permission);

    if (permission === "granted") {
      // console.log("Permission granted. Getting FCM token...");
      const currentToken = await getToken(messaging, { vapidKey: `${process.env.REACT_APP_FIREBASE_VAPID_KEY}` });
      // console.log("FCM Token obtained:", currentToken);

      if (currentToken) {
        // console.log("FCM Token:", currentToken);
        const deviceId = getOrGenerateDeviceId();
        // console.log("Device ID:", deviceId);
        await sendTokenToServer(currentToken, deviceId);
      } else {
        console.log("No registration token available.");
      }
    } else {
      console.log("Notification permission not granted");
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }
};

const getOrGenerateDeviceId = () => {
  // console.log("Fetching or generating device ID...");
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    // console.log("Device ID not found in localStorage. Generating a new ID...");
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId);
    // console.log("Generated new Device ID:", deviceId);
  } else {
    console.log("Found Device ID in localStorage:", deviceId);
  }
  return deviceId;
};

const sendTokenToServer = async (token, deviceId) => {
  const userId = localStorage.getItem('userId');
  const authtoken = localStorage.getItem('token');
  // console.log("Sending token and device ID to the server...");
  try {
    const response = await fetch(`${process.env.REACT_APP_URL}/notification/requesttoken?isWeb=true`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authtoken}`
      },
      body: JSON.stringify({
        userId :  userId,
        webFireBaseToken :  token,
        deviceId: deviceId }),
    });
    // console.log(response);

    if (response.ok) {
      console.log("Token and Device ID sent to the server successfully.");
    } else {
      console.error("Failed to send token to the server. Response status:", response.status);
    }
  } catch (error) {
    console.error("Error sending token to server:", error);
  }
};
