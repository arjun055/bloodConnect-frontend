// self.addEventListener("push", (event) => {
//     const data = event.data.json();

    
//     const options = {
//       body: data.message,
//       icon: "/assets/notification-icon.png",
//       badge: "/assets/badge-icon.png",
//       requireInteraction: true,
//     };
    
//     console.log(data.title);

//     event.waitUntil(
//       self.registration.showNotification(data.title, options)
//         .then(()=> console.log("wait is over"))
//         .catch(err => console.error("Error showing notification:", err))
//     );

//     // event.waitUntil(
//     //   (async () => {
//     //     // 1. Show browser notification
//     //     await self.registration.showNotification(data.title, options);
  
//     //     // 2. Send message to client (Donor.jsx)
//     //     const allClients = await self.clients.matchAll({
//     //       includeUncontrolled: true,
//     //     });
  
//     //     for (const client of allClients) {
//     //       client.postMessage({
//     //         type: "NEW_NOTIFICATION",
//     //         title: data.title,
//     //         message: data.message,
//     //       });
//     //     }
  
//     //     console.log("Notification displayed and message sent to client ✅");
//     //   })()
//     // );

//     console.log("showNotification is called");
//   });



self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.warn("Payload not JSON, falling back to text:", e);
    data = {
      title: "New Notification",
      message: event.data.text()
    };
  }

  const options = {
    body: data.message,
    icon: "/assets/notification-icon.png",
    badge: "/assets/badge-icon.png",
    requireInteraction: true,
  };

  console.log("Push Title:", data.title);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log("Notification shown ✅"))
      .catch(err => console.error("Error showing notification:", err))
  );

  console.log("showNotification is called");
});

  