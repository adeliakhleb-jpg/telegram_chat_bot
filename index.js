import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY;

const VERSION_ID = process.env.VERSION_ID;

// webhook endpoint

app.post("/webhook", async (req, res) => {

  const message = req.body.message;

  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;

  const text = message.text;

  if (text === "/start") {

  await axios.post(

    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,

    {

      chat_id: chatId,

      text: `Привет.  

Это пространство, где тебе не нужно быть правильным.

Можешь не объяснять красиво.  

Не анализировать.  

Не собирать себя в “нормального”.

Просто скажи, что сейчас происходит внутри.`,

    }

  );

  return res.sendStatus(200);

}

  try {

    console.log("VERSION:", VERSION_ID);
    
    // отправляем в Voiceflow

    const vfRes = await axios.post(

      `https://general-runtime.voiceflow.com/state/user/${chatId}/interact`,

      {

        request: {

          type: "text",

          payload: text,

        },

      },

      {

        headers: {

          Authorization: VOICEFLOW_API_KEY,

          versionID: VERSION_ID,

          "Content-Type": "application/json",

        },

      }

    );

    // достаём ответ

    const replies = vfRes.data;

    console.log("VOICEFLOW RESPONSE:");

    console.log(JSON.stringify(vfRes.data, null, 2));
    
    for (let item of replies) {

      if (item.type === "text") {

        await axios.post(

          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,

          {

            chat_id: chatId,

            text: item.payload.message,

          }

        );

      }

    }

  } catch (err) {

    console.error(err);

  }

  res.sendStatus(200);

});



app.get("/", (req, res) => {

  res.status(200).send("Bot is running");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server started on port ${PORT}`);

});
