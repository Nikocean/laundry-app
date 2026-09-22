/**
 * FCM push stub (REQ-COURIER-02 / REQ-RT-03).
 * Phase later will call Firebase Admin / FCM HTTP v1.
 */
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, string> }
): Promise<void> {
  console.log(
    `[fcm:stub] user=${userId} title=${payload.title} body=${payload.body}`
  );
}
