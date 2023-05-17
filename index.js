const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const OPENAI_API_KEY = "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";
initializeApp();
const db = getFirestore();


exports.webhook = onRequest(
    {timeoutSeconds: 15, cors: true, maxInstances: 10},
    async (req, res) => {
      try {
        const data = req.body;
        const docRef = await db.doc(`chats/${data.waId}`).set({
          name: data.name, waId: data.waId});
        console.log(`Webhook data stored with ID: ${docRef.id}`);
        res.status(200).send("Webhook data received and stored successfully!");
      } catch (error) {
        console.error(`Error storing webhook data: ${error}`);
        res.status(500).send("Error storing webhook data");
      }
    });
exports.chatWithGPT = onRequest(
    async (req, res) => {
      // eslint-disable-next-line no-undef
      const promptMessages = `${role}: ${prompt}\n${system}:`;

      try {
        // eslint-disable-next-line no-undef
        const response = await axios.post(
            "https://api.openai.com/v1/engines/davinci-codex/completions",
            {
              prompt: promptMessages,
              max_tokens: 50,
              n: 1,
              stop: "\n",
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
              },
            },
        );
        const message = response.data.choices[0].text.trim();
        // eslint-disable-next-line no-undef
        const firestore = admin.firestore();
        // eslint-disable-next-line max-len
        await firestore.collection("messages").add({prompt: promptMessages, message});

        res.status(200).json({message});
      } catch (err) {
        console.error(err);
        res.status(500).json({error: "Something went wrong"});
      }
    });

