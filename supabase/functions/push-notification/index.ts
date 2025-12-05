import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// You must set these in your Supabase Dashboard -> Settings -> Edge Functions -> Secrets
// VAPID_PRIVATE_KEY: "ltCrmNVM9kuRNqa7dsAjQDaMCGU7U1vA41dqW-st_88"
// VAPID_PUBLIC_KEY: "BPH94Y0Ag6JPz4YRz-Vw2nRvdv5EGxH7Septgl12tQ9IH7Phh5zKqCsJe1aAW7nLNKNNP7X4hh8hdrXq5P8fFag"
// VAPID_Nt: "mailto:your-email@example.com"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        const { record } = await req.json();

        if (!record) {
            return new Response("No record provided", { status: 400 });
        }

        const userId = record.user_id;
        const { title, message, action_url, metadata } = record;

        console.log(`Sending push for user: ${userId}`);

        // Fetch user subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            console.log("No subscriptions found for user");
            return new Response("No subscriptions", { status: 200 });
        }

        // Configure Web Push
        const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
        const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
        const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@speaklife.app";

        if (!vapidPrivateKey || !vapidPublicKey) {
            console.error("VAPID keys not set in environment variables");
            return new Response("Server config error", { status: 500 });
        }

        webpush.setVapidDetails(
            vapidSubject,
            vapidPublicKey,
            vapidPrivateKey
        );

        const payload = JSON.stringify({
            title: title,
            body: message,
            url: action_url,
            metadata: metadata || {}
        });

        const results = await Promise.all(
            subscriptions.map(async (sub) => {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: atob(sub.p256dh).split('').map(c => c.charCodeAt(0)), // Decode back if needed, but web-push handles standard objects. 
                            // Wait, web-push expects base64url encoded strings. The DB stores them base64 encoded by our frontend code?
                            // Frontend: `btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))` -> Standard Base64
                            // web-push might want them as strings. Let's pass them as strings.
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    };

                    // Fix for potential encoding diffs: The node-web-push library expects keys to be strings.
                    // However, if they are Standard Base64, we might need to convert to Base64URL?
                    // Actually, libraries are usually smart enough. Let's try direct first.

                    // Correction: The `sub` object we stored in DB has `endpoint`, `p256dh`, `auth`.
                    // `web-push` expects subscription object: { endpoint: '...', keys: { p256dh: '...', auth: '...' } }

                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            auth: sub.auth,
                            p256dh: sub.p256dh
                        }
                    }, payload);

                    return { success: true, id: sub.id };
                } catch (err) {
                    console.error(`Failed to send to sub ${sub.id}:`, err);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription gone, remove from DB
                        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                    }
                    return { success: false, error: err };
                }
            })
        );

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error processing push:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
