import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

dotenv.config();

// ==================== TYPES ====================

interface Contact {
  id: number;
  name: string;
  phone: string;
  raw?: Record<string, unknown>;
}

interface SendSmsRequest {
  contacts: Contact[];
  message: string;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  batchSize?: number;
  campaignName?: string;
}

interface SmsResult {
  id: number;
  phone: string;
  name: string;
  status: 'sent' | 'failed';
  sid?: string;
  messageStatus?: string;
  error?: string;
}

// ==================== APP SETUP ====================

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Multer config for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Sirf Excel (.xlsx, .xls) ya CSV files allowed hain!'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// ==================== HELPERS ====================

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    cleaned = '+91' + cleaned.substring(1);
  }

  if (!cleaned.startsWith('+') && cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    cleaned = '+91' + cleaned;
  }

  if (!cleaned.startsWith('+') && cleaned.length > 10) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

function findColumn(keys: string[], possibleNames: string[]): string | undefined {
  return keys.find(k => possibleNames.includes(k.toLowerCase().trim()));
}

// ==================== API ROUTES ====================

const CAMPAIGNS_FILE = path.join(__dirname, 'campaigns.json');

async function getCampaigns() {
  try {
    const data = await fsPromises.readFile(CAMPAIGNS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function saveCampaign(campaign: any) {
  const campaigns = await getCampaigns();
  campaigns.unshift(campaign); // Add to beginning
  await fsPromises.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

app.get('/api/campaigns', async (req: Request, res: Response) => {
  try {
    const campaigns = await getCampaigns();
    res.json({ success: true, campaigns });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to load campaigns' });
  }
});

// Upload & Parse Excel File
app.post('/api/upload', upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Koi file upload nahi hui!' });
      return;
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      res.status(400).json({ error: 'Excel file khaali hai!' });
      return;
    }

    const firstRow = data[0];
    const keys = Object.keys(firstRow);

    const phoneKeys = [
      'phone', 'phone number', 'phonenumber', 'mobile', 'mobile number',
      'mobilenumber', 'number', 'contact', 'cell', 'telephone', 'tel',
      'phone_number', 'mobile_number', 'contact_number'
    ];
    const nameKeys = [
      'name', 'full name', 'fullname', 'first name', 'firstname',
      'customer', 'customer name', 'naam', 'full_name', 'first_name'
    ];

    let phoneCol = findColumn(keys, phoneKeys);
    let nameCol = findColumn(keys, nameKeys);

    if (!phoneCol) {
      phoneCol = keys.find(k => {
        const sample = String(firstRow[k]);
        return /^[\+]?[\d\s\-\(\)]{7,15}$/.test(sample.trim());
      }) || keys[0];
    }

    if (!nameCol) {
      nameCol = keys.find(k => k !== phoneCol) || keys[0];
    }

    const contacts: Contact[] = data
      .map((row, index) => ({
        id: index + 1,
        name: String(row[nameCol!] || `Contact ${index + 1}`).trim(),
        phone: formatPhone(String(row[phoneCol!] || '').trim()),
        raw: row
      }))
      .filter(c => c.phone.length >= 7);

    res.json({
      success: true,
      totalRows: data.length,
      validContacts: contacts.length,
      columns: keys,
      phoneColumn: phoneCol,
      nameColumn: nameCol,
      contacts
    });

  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File parse karne mein error: ' + error });
  }
});

// Download Excel Template
app.get('/api/template', (req: Request, res: Response) => {
  try {
    const data = [
      { Name: 'Ahmed Khan', Number: '9027553670' },
      { Name: 'Sara Ali', Number: '9876543210' }
    ];

    const instructions = [
      { Info: "1. App hamesha pehli sheet ko hi read karta hai." },
      { Info: "2. Sheet mein 'Name' aur 'Number' columns zarur hone chahiye." },
      { Info: "3. Number ke aage country code (+91) automatically lag jayega agar nahi daala to." }
    ];

    const ws1 = XLSX.utils.json_to_sheet(data);
    const ws2 = XLSX.utils.json_to_sheet(instructions);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Contacts");
    XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="sms_contacts_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Template error:', err);
    res.status(500).json({ error: 'Template generation failed' });
  }
});

// Send SMS to selected contacts
app.post('/api/send-sms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contacts, message, accountSid, authToken, fromNumber }: SendSmsRequest = req.body;

    if (!contacts || contacts.length === 0) {
      res.status(400).json({ error: 'Koi contact select nahi kiya!' });
      return;
    }
    if (!message || message.trim() === '') {
      res.status(400).json({ error: 'Message likhna zaroori hai!' });
      return;
    }
    if (!accountSid || !authToken || !fromNumber) {
      res.status(400).json({ error: 'Twilio credentials daalna zaroori hai!' });
      return;
    }

    const twilio = require('twilio')(accountSid, authToken);
    const results: SmsResult[] = [];

    for (const contact of contacts) {
      try {
        const msg = await twilio.messages.create({
          body: message,
          from: fromNumber,
          to: contact.phone
        });

        results.push({
          id: contact.id,
          phone: contact.phone,
          name: contact.name,
          status: 'sent',
          sid: msg.sid,
          messageStatus: msg.status
        });
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        results.push({
          id: contact.id,
          phone: contact.phone,
          name: contact.name,
          status: 'failed',
          error
        });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    res.json({ success: true, total: contacts.length, sent, failed, results });

  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Send error:', error);
    res.status(500).json({ error: 'SMS bhejne mein error: ' + error });
  }
});

// Send SMS in batches
app.post('/api/send-batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contacts, message, accountSid, authToken, fromNumber, batchSize, campaignName }: SendSmsRequest = req.body;

    if (!contacts || contacts.length === 0) {
      res.status(400).json({ error: 'Koi contact select nahi kiya!' });
      return;
    }

    const twilio = require('twilio')(accountSid, authToken);
    const size: number = batchSize || 10;
    const results: SmsResult[] = [];

    for (let i = 0; i < contacts.length; i += size) {
      const batch = contacts.slice(i, i + size);

      const batchPromises = batch.map(async (contact: Contact): Promise<SmsResult> => {
        try {
          const msg = await twilio.messages.create({
            body: message,
            from: fromNumber,
            to: contact.phone
          });
          return {
            id: contact.id,
            phone: contact.phone,
            name: contact.name,
            status: 'sent',
            sid: msg.sid
          };
        } catch (err: unknown) {
          const error = err instanceof Error ? err.message : 'Unknown error';
          return {
            id: contact.id,
            phone: contact.phone,
            name: contact.name,
            status: 'failed',
            error
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    // Save campaign record
    const finalCampaignName = campaignName && campaignName.trim() ? campaignName.trim() : `Campaign ${new Date().toLocaleString()}`;
    const status = failed === 0 ? 'completed' : (sent === 0 ? 'failed' : 'partially_failed');

    await saveCampaign({
      id: Date.now().toString(),
      name: finalCampaignName,
      date: new Date().toISOString(),
      message,
      totalContacts: contacts.length,
      sent,
      failed,
      status
    });

    res.json({ success: true, total: contacts.length, sent, failed, results });

  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Batch send error:', error);
    res.status(500).json({ error: 'Batch SMS error: ' + error });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 Twilio SMS Server Running!         ║
  ║   📡 http://localhost:${PORT}              ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
