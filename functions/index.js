/**
 * Firebase Cloud Functions for Yuva Shakti Group (Bhati Parivar Kuchera)
 * Includes:
 * 1. Daily 8:00 AM Suvichar Cron Job
 * 2. Amavasya Dues Reminder (4 times on Amavasya day: 08:00, 12:00, 16:00, 20:00 IST)
 * 3. Amavasya Eve Meeting Alert (Day before Amavasya at 6:00 PM IST)
 * 4. Daily 7:00 AM Ancestor Punyatithi Check & Tribute Alert
 * 5. Manual Admin Callables for instant Sanchalak push broadcasts
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Cron Job: Every Day at 8:00 AM IST (2:30 AM UTC)
 * Sends Daily Suvichar to all registered member devices
 */
exports.scheduledDailySuvichar = functions.pubsub
  .schedule('30 2 * * *') // 08:00 AM IST (UTC+5:30)
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Running daily 8:00 AM Suvichar broadcast');

    const suvicharSnapshot = await db.collection('daily_suvichar').orderBy('date', 'desc').limit(1).get();
    let quoteText = "संगठन में ही शक्ति है। जब पूरा परिवार एक साथ कदम बढ़ाता है, तो कोई भी कठिनाई बड़ी नहीं होती।";
    let senderName = "रेवंतराम भाटी (8696663615)";

    if (!suvicharSnapshot.empty) {
      const data = suvicharSnapshot.docs[0].data();
      quoteText = data.text || quoteText;
      senderName = data.sender || senderName;
    }

    const payload = {
      notification: {
        title: '🚩 आज का सुविचार • युवा शक्ति ग्रुप',
        body: `${quoteText} — प्रेषक: ${senderName}`,
      },
      data: {
        type: 'suvichar',
        url: '/',
      },
    };

    return sendNotificationToAllMembers(payload);
  });

/**
 * 2. Cron Job: 4 times on Amavasya day (08:00, 12:00, 16:00, 20:00 IST)
 * Sends Pending Dues Reminder
 */
exports.scheduledAmavasyaDuesReminder = functions.pubsub
  .schedule('0 8,12,16,20 * * *') // 4 times daily, filtered by Amavasya check
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if today is marked as Amavasya in festivals calendar
    const calendarDoc = await db.collection('festivals').doc(todayStr).get();
    const isAmavasya = calendarDoc.exists && calendarDoc.data().isAmavasya;

    if (!isAmavasya) {
      console.log('Today is not Amavasya. Skipping reminder.');
      return null;
    }

    console.log('Today is Amavasya! Sending dues reminders to pending members...');

    const pendingMembersSnapshot = await db.collection('members').where('currentMonthPaid', '==', false).get();
    const tokens = [];

    pendingMembersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) return null;

    const message = {
      notification: {
        title: '🌙 अमावस्या पूंजी व सहयोग दिवस • युवा शक्ति ग्रुप',
        body: 'जय श्री राम! आज अमावस्या है। कृपया अपने परिवार कल्याण कोष की मासिक सहयोग राशि (PhonePe/UPI 7850983600@ibl) पर समय पर जमा कराएं।',
      },
      data: {
        type: 'amavasya_due',
        url: '/contributions',
      },
      tokens,
    };

    return admin.messaging().sendEachForMulticast(message);
  });

/**
 * 3. Cron Job: Amavasya Eve Meeting Alert (Every day at 6:00 PM IST / 12:30 PM UTC)
 * Checks if tomorrow is Amavasya, and sends meeting alert
 */
exports.scheduledAmavasyaMeetingEveAlert = functions.pubsub
  .schedule('30 12 * * *') // 6:00 PM IST
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const calendarDoc = await db.collection('festivals').doc(tomorrowStr).get();
    const isTomorrowAmavasya = calendarDoc.exists && calendarDoc.data().isAmavasya;

    if (!isTomorrowAmavasya) {
      console.log('Tomorrow is not Amavasya. Skipping eve alert.');
      return null;
    }

    console.log('Tomorrow is Amavasya! Broadcasting eve meeting notice at 6:00 PM...');

    const payload = {
      notification: {
        title: '🌙 कल अमावस्या की पावन बैठक • युवा शक्ति ग्रुप',
        body: 'कल अमावस्या की पावन बैठक है। सभी परिवारजन समय पर अपनी उपस्थिति दर्ज कराएं एवं मासिक सहयोग प्रदान करें।',
      },
      data: {
        type: 'amavasya_meeting_eve',
        url: '/calendar',
      },
    };

    return sendNotificationToAllMembers(payload);
  });

/**
 * 4. Cron Job: Daily 7:00 AM Punyatithi & Ancestor Tribute Check (1:30 AM UTC)
 */
exports.scheduledAncestorTributeCheck = functions.pubsub
  .schedule('30 1 * * *') // 07:00 AM IST
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayMMDD = `${month}-${day}`;

    const ancestorsSnapshot = await db.collection('ancestors').get();
    const tributesToday = [];

    ancestorsSnapshot.forEach((doc) => {
      const anc = doc.data();
      if (anc.demiseDate && anc.demiseDate.endsWith(todayMMDD)) {
        tributesToday.push(anc);
      }
    });

    if (tributesToday.length === 0) return null;

    for (const anc of tributesToday) {
      const payload = {
        notification: {
          title: '🙏 आदरणीय पूर्वज पुण्य-तिथि श्रद्धांजलि',
          body: `आज हमारे आदरणीय पूर्वज ${anc.name} जी की पुण्य-तिथि है। परिवार की ओर से उन्हें भावभीनी श्रद्धांजलि।`,
        },
        data: {
          type: 'punyatithi',
          ancestorId: anc.id || '',
        },
      };
      await sendNotificationToAllMembers(payload);
    }
  });

/**
 * 5. Manual Triggers for Sanchalak (Callable from Admin Web Panel)
 */
exports.sendManualSuvicharBroadcast = functions.https.onCall(async (data, context) => {
  const quoteText = data.quote || "संगठन में ही शक्ति है...";
  const sender = data.sender || "रेवंतराम भाटी (8696663615)";

  const payload = {
    notification: {
      title: '🚩 आज का सुविचार • युवा शक्ति ग्रुप',
      body: `${quoteText} (प्रेषक: ${sender})`,
    },
    data: {
      type: 'suvichar_manual',
    },
  };

  return sendNotificationToAllMembers(payload);
});

exports.sendManualDuesReminder = functions.https.onCall(async (data, context) => {
  const payload = {
    notification: {
      title: '⏰ बकाया अंशदान स्मरण • युवा शक्ति ग्रुप',
      body: 'जय श्री राम! आपका अमावस्या मासिक अंशदान अभी बाकी है। कृपया PhonePe/UPI (7850983600@ibl) से जल्द जमा कराएं।',
    },
    data: {
      type: 'dues_reminder_manual',
    },
  };

  return sendNotificationToAllMembers(payload);
});

exports.sendManualAmavasyaMeetingAlert = functions.https.onCall(async (data, context) => {
  const payload = {
    notification: {
      title: '🌙 कल अमावस्या की पावन बैठक • युवा शक्ति ग्रुप',
      body: 'कल अमावस्या की पावन बैठक है। सभी परिवारजन समय पर अपनी उपस्थिति दर्ज कराएं।',
    },
    data: {
      type: 'amavasya_meeting_alert',
    },
  };

  return sendNotificationToAllMembers(payload);
});

exports.sendManualAncestorTributeAlert = functions.https.onCall(async (data, context) => {
  const name = data.name || "स्व. श्री मूलाराम जी भाटी";
  const payload = {
    notification: {
      title: '🙏 आदरणीय पूर्वज पुण्य-तिथि श्रद्धांजलि',
      body: `आज हमारे आदरणीय पूर्वज ${name} जी की पुण्य-तिथि है। परिवार की ओर से उन्हें भावभीनी श्रद्धांजलि।`,
    },
    data: {
      type: 'ancestor_tribute_manual',
    },
  };

  return sendNotificationToAllMembers(payload);
});

async function sendNotificationToAllMembers(payload) {
  const tokensSnapshot = await db.collection('fcm_tokens').get();
  const tokens = [];
  tokensSnapshot.forEach((d) => {
    if (d.data().token) tokens.push(d.data().token);
  });

  if (tokens.length === 0) {
    console.log('No registered FCM tokens found in fcm_tokens collection.');
    return { success: false, count: 0 };
  }

  const response = await admin.messaging().sendEachForMulticast({
    ...payload,
    tokens,
  });

  console.log(`Successfully sent ${response.successCount} messages.`);
  return { success: true, sentCount: response.successCount };
}
