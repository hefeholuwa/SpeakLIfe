import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// VAPID Keys (Generated earlier)
const publicVapidKey = 'BI2P8Xe2ybnaqVQIcXdxltkv0RZ6I9_0JGIlQbngRzHuj7bVRjUxYazTB6qLnkjJ1qKPf6MXvowqAsVFh3YOERo';
const privateVapidKey = 'dWqv0D4IoFix4LJmPZsW9fU83KPCJwR6KkfeiILtqbA';

webpush.setVapidDetails(
    'mailto:admin@speaklife.app',
    publicVapidKey,
    privateVapidKey
);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendPushNotification() {
    console.log('🚀 Starting push notification broadcast...');

    try {
        // 1. Fetch all subscriptions
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) throw error;

        console.log(`📋 Found ${subscriptions.length} subscriptions.`);

        if (subscriptions.length === 0) {
            console.log('⚠️ No subscribers found. Enable notifications in the app first!');
            return;
        }

        // 2. Define the notification payload
        const payload = JSON.stringify({
            title: 'Good Morning! ☀️',
            body: 'Start your day with power. Tap to see today\'s verse.',
            icon: '/icons/icon-192x192.png',
            url: '/' // Open the app
        });

        // 3. Send to all subscribers
        let successCount = 0;
        let failCount = 0;

        for (const sub of subscriptions) {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                await webpush.sendNotification(pushSubscription, payload);
                console.log(`✅ Sent to user ${sub.user_id}`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to send to user ${sub.user_id}:`, err.message);
                failCount++;

                // If 410 Gone, remove subscription
                if (err.statusCode === 410) {
                    console.log('🗑️ Removing expired subscription...');
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
            }
        }

        console.log(`\n🎉 Finished! Sent: ${successCount}, Failed: ${failCount}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

sendPushNotification();
