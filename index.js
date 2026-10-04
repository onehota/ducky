const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // لدعم إرسال النصوص والصور المشفّرة بـ Base64

// مصفوفة مؤقتة في الذاكرة لتخزين الرسائل (للتجربة)
// ملاحظة: يُنصح بربط قاعدة بيانات مستقبلاً لأن Vercel يقيد الذاكرة المؤقتة
let messages = [];

// الصفحة الرئيسية لتأكيد عمل السيرفر
app.get('/', (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running perfectly!" });
});

// 1. إرسال رسالة جديدة (نصية أو تحتوي رابط صورة)
app.post('/api/messages/send', (req, res) => {
  const { sender, receiver, text, imageUrl } = req.body;

  if (!sender || (!text && !imageUrl)) {
    return res.status(400).json({ status: "error", message: "Missing sender, text, or imageUrl" });
  }

  const newMessage = {
    id: Date.now().toString(),
    sender,
    receiver: receiver || "global",
    text: text || "",
    imageUrl: imageUrl || null,
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);

  return res.status(201).json({
    status: "success",
    message: "Message sent successfully",
    data: newMessage
  });
});

// 2. جلب جميع الرسائل أو رسائل محادثة معينة
app.get('/api/messages', (req, res) => {
  const { room } = req.query;
  
  if (room) {
    const filtered = messages.filter(m => m.receiver === room || m.sender === room);
    return res.status(200).json({ status: "success", data: filtered });
  }

  return res.status(200).json({ status: "success", data: messages });
});

module.exports = app;
