"use client";

import { useEffect, useState } from "react";
import { Event, Filter, SimplePool, verifyEvent } from "nostr-tools";

interface NostrWindow {
  getPublicKey(): Promise<string>;
  signEvent(event: object): Promise<Event>;
}

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pk = localStorage.getItem("pk");
      if (pk) {
        setIsSignedIn(true);
      }
    }
  }, []);

  const handleExtensionLogin = async () => {
    try {
      const pk = await (window.nostr as NostrWindow).getPublicKey();
      localStorage.setItem("pk", pk);
      localStorage.setItem("signingMethod", "extension");
      setIsSignedIn(true);
      setError("");
    } catch (error) {
      console.log(error);
      setError("Sign-in failed... fiatjaf is laughing at you");
    }
  };

  const handlePost = async () => {
    setSuccess("");
    setError("");
    try {
      const day = new Date().getDay();
      const message =
        day >= 1 && day <= 5
          ? "GM nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6"
          : "gfy nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6";
      const event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: message,
      };
      const signedEvent = await (window.nostr as NostrWindow).signEvent(event);
      const isGood = verifyEvent(signedEvent);

      if (isGood) {
        const pool = new SimplePool();

        const combinedRelayList: string[] = [];

        const relayfilter: Filter = {
          kinds: [10002],
          authors: [
            "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
          ],
        };

        const f = pool.subscribeMany(
          [
            "wss://relay.damus.io",
            "wss://nos.lol",
            "wss://purplepag.es",
            "wss://relay.primal.net",
            "wss://relay.nostr.band",
          ],
          [relayfilter],
          {
            onevent(event) {
              const validRelayTags = event.tags.filter(
                (tag) => tag[0] === "r" && (!tag[2] || tag[2] === "read"),
              );
              console.log("tags", validRelayTags);

              validRelayTags.forEach((tag) => combinedRelayList.push(tag[1]));
            },
            oneose: async () => {
              f.close();
              console.log("relays", combinedRelayList);
              await Promise.any(pool.publish(combinedRelayList, signedEvent));
              setSuccess(
                day >= 1 && day <= 5
                  ? "Success... fiatjaf says gfy"
                  : "Success... fiatjaf says GM",
              );
            },
          },
        );
      } else {
        setError("Post failed... fiatjaf is laughing at you");
      }
    } catch (error) {
      console.log(error);
      setError("Post failed... fiatjaf is laughing at you");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-purple-900 rounded-lg shadow-xl p-8 w-full max-w-md">
        {!isSignedIn ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-xl font-bold">FiatjafBuzz</span>
            <button
              onClick={() => handleExtensionLogin()}
              className="w-full bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors"
            >
              Sign in with extension
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="text-xl font-bold">FiatjafBuzz</span>
            <button
              onClick={handlePost}
              className="w-full bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors"
            >
              {new Date().getDay() >= 1 && new Date().getDay() <= 5
                ? 'Post "GM fiatjaf"'
                : 'Post "gfy fiatjaf"'}
            </button>
          </div>
        )}
        {success && (
          <p className="text-center py-2 px-4 text-green-500">{success}</p>
        )}
        {error && <p className="text-center py-2 px-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}
