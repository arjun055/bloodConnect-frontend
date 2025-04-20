import React, { useRef, useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import RoomIcon from '@mui/icons-material/Room';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { QRCodeCanvas } from "qrcode.react";


function Donor() {
    const [viewState, setViewState] = useState({
      latitude: 12.9716, // fallback location like Bangalore
      longitude: 77.5946,
      zoom: 13
    });
    const [userLocation, setUserLocation] = useState(null);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [selectedBB, setSelectedBB] = useState(null);
    const [donationDate, setDonationDate] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const timeoutRef = useRef(null);


    useEffect(() => {
        const setupPushNotifications = async () => {
          if ("serviceWorker" in navigator && "PushManager" in window) {
            try {
              // 1. Register service worker
              const register = await navigator.serviceWorker.register("/service-worker.js");
              console.log("Service Worker registered:", register);

    
              // 2. Request push permission
              const permission = await Notification.requestPermission();
              if (permission !== "granted") {
                console.log("Permission not granted for notifications");
                return;
              }
    
              // 3. Subscribe to push
              const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array("BOjZeZcQjDEn4bRTgzYNBPu-8ylqLBgEjnNofCtxETxd1438fHsVixvtCjQkqrcxRMzkjEkfPgWij5FeXLvu_og"),
              });
              
              const userData = JSON.parse(localStorage.getItem("user"));
              const userId = userData?.id;
            
              if (!userId) {
                console.error("User ID not found in localStorage");
                return;
              }


              // 4. Send subscription to backend
              await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/subscribe`, { subscription, userId });
    
              console.log("Push subscription successful!");
    
            } catch (err) {
              console.error("Error during push setup:", err);
            }
          }
        };
    
        setupPushNotifications();
    }, []);


    //pop up for fake notifications
    useEffect(() => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          console.log("Received message from service worker:", event.data);
  
          if (event.data && event.data.type === "NEW_NOTIFICATION") {
            // Show your custom popup on donor side!
            alert(`🚨 New Blood Request! 🚨\nTitle: ${event.data.title}\nMessage: ${event.data.message}`);
            
            // Later you can replace this alert with a super cool popup 🚀
          }
        });
      }
    }, []);


    // Helper function for VAPID key conversion
    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    // Get user's current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                setViewState({ latitude, longitude, zoom: 13 });
            },
            (error) => console.error('Error getting location:', error)
        );
    }, []);

    // Fetch blood banks from backend
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bloodbanks`)
            .then((response) => {
              setBloodBanks(response.data);
              console.log('BloodBanks:',bloodBanks);
            })
            .catch(error => console.error('Error fetching blood banks:', error));
    },[]);

    useEffect(() => {
      console.log('Selected Blood Bank:', selectedBB);
    }, [selectedBB]);


    // Handle marker click - Show form
    const handleMarkerClick = (bloodBank) => {
        if (bloodBank?.longitude && bloodBank?.latitude) {
            setDonationDate('');
            setQrCodeData('');
            if(timeoutRef.current){
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                setSelectedBB(bloodBank);
            }, 300);
        }else{
            alert("blood bank clicked without coordinates");
        }
    };

    // Handle form submission - Generate QR Code
    const handleSubmit = (e) => {
        e.preventDefault();
        const donorEmail = selectedBB.mail || "donorEmail"; // Replace with actual donor's email from context/auth
        const qrData = `${donationDate}_${donorEmail}`;
        setQrCodeData(qrData);
    };

    return (
        <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
        >
            {/* Show user location marker */}
            {userLocation && (
                <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="bottom">
                    <RoomIcon style={{ color: 'blue', fontSize: '36px' }} />
                </Marker>
            )}

            {/* Render blood bank markers */}
            {bloodBanks.length > 0 && bloodBanks.map((bb) => (
                bb.longitude && bb.latitude && (
                    <Marker
                        key={bb._id}
                        longitude={bb.longitude}
                        latitude={bb.latitude}
                        anchor="bottom"
                    >
                        <RoomIcon
                          style={{ color: 'red', fontSize: '36px', cursor: 'pointer' }}
                          onClick={() => handleMarkerClick(bb)}
                        />
                    </Marker>
                )
            ))}

            {/* Popup with donation form */}
            {selectedBB && (
                <Popup 
                    longitude={selectedBB.longitude} 
                    latitude={selectedBB.latitude} 
                    anchor="top" 
                    onClose={() => setSelectedBB(null)}
                >
                    <div className="popup-animation">
                        <h3>{selectedBB.name || 'Blood Bank'}</h3>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Date of Donation:
                                <input type="date" value={donationDate} onChange={(e) => setDonationDate(e.target.value)} required />
                            </label>
                            <button type="submit">Generate QR Code</button>
                        </form>

                        {/* Display QR Code */}
                        {qrCodeData && (
                            <div>
                                <h4>Your QR Code:</h4>
                                <QRCodeCanvas value={qrCodeData} />
                            </div>
                        )}
                    </div>
                </Popup>
            )}
        </Map>
    );
}

export default Donor;



