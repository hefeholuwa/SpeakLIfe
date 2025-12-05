import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Setup Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    console.log("Edge Function received request");

    try {
        // 1. Parse Request
        const body = await req.json();
        console.log("Request Body:", JSON.stringify(body));

        // Support both direct calls ( { record: ... } ) and test calls ( { ... } directly)
        const record = body.record || body;

        if (!record || !record.user_id) {
            console.error("Missing user_id in record");
            return new Response("Missing user_id", { status: 400 });
        }

        const userId = record.user_id;
        const title = record.title || "SpeakLife Notification";
        const message = record.message || "You have a new update";
        const action_url = record.action_url || "/";
        const metadata = record.metadata || {};

        console.log(`Processing push for User ID: ${userId}`);

        // 2. Fetch Subscriptions
        const { data: subscriptions, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Database error fetching subscriptions:", error);
            return new Response("DB Error", { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.log("No subscriptions found for user using ID:", userId);
            return new Response("No subscriptions found", { status: 200 });
        }

        console.log(`Found ${subscriptions.length} subscriptions`);

        // 3. Setup VAPID
        const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
        const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
        const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@speaklife.app";

        if (!vapidPrivateKey || !vapidPublicKey) {
            console.error("CRITICAL: VAPID keys missing in environment");
            return new Response("Server Misconfiguration: Missing VAPID Keys", { status: 500 });
        }

        try {
            webpush.setVapidDetails(
                vapidSubject,
                vapidPublicKey,
                vapidPrivateKey
            );
            console.log("VAPID Details set successfully");
        } catch (err) {
            console.error("Error setting VAPID details:", err);
            return new Response("Server Misconfiguration: Invalid VAPID Keys", { status: 500 });
        }

        // 4. Send Notifications
        const payload = JSON.stringify({
            title,
            body: message,
            url: action_url,
            metadata
        });

        const results = await Promise.all(
            subscriptions.map(async (sub) => {
                try {
                    console.log(`Sending to endpoint: ${sub.endpoint.substring(0, 30)}...`);

                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            auth: sub.auth,
                            p256dh: sub.p256dh
                        }
                    }, payload);

                    console.log(`Success sending to sub ${sub.id}`);
                    return { success: true, id: sub.id };
                } catch (err) {
                    console.error(`Failed to send to sub ${sub.id}:`, err);

                    if (err.statusCode === 410 || err.statusCode === 404) {
                        console.log(`Removing stale subscription ${sub.id}`);
                        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                    }
                    return { success: false, error: err.message };
                }
            })
        );

        console.log("Processing complete", JSON.stringify(results));

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Unhandled Error in Edge Function:", error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
