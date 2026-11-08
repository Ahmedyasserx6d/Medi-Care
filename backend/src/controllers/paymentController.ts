import { Request, Response } from 'express';
import crypto from 'crypto';
import Appointment from '../models/Appointment';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { appointmentId, paymentMethodType } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    const mockPaymentToken = "PAYMOB_TOKEN_XYZ_789";
    const mockOrderId = "123456789";

    res.status(200).json({
      message: "Payment initiated",
      paymentToken: mockPaymentToken,
      orderId: mockOrderId
    });

  } catch (error) {
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

export const paymobWebhook = async (req: Request, res: Response) => {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET!;
    const receivedHmac = req.query.hmac as string;
    
    const { obj } = req.body; 
    
    const amount_cents = obj.amount_cents;
    const created_at = obj.created_at;
    const currency = obj.currency;
    const error_occured = obj.error_occured;
    const has_parent_transaction = obj.has_parent_transaction;
    const id = obj.id;
    const integration_id = obj.integration_id;
    const is_3d_secure = obj.is_3d_secure;
    const is_auth = obj.is_auth;
    const is_capture = obj.is_capture;
    const is_refunded = obj.is_refunded;
    const is_standalone_payment = obj.is_standalone_payment;
    const is_voided = obj.is_voided;
    const orderId = obj.order.id;
    const owner = obj.owner;
    const pending = obj.pending;
    const source_data_pan = obj.source_data.pan;
    const source_data_sub_type = obj.source_data.sub_type;
    const source_data_type = obj.source_data.type;
    const success = obj.success;

    const concatenatedString = `${amount_cents}${created_at}${currency}${error_occured}${has_parent_transaction}${id}${integration_id}${is_3d_secure}${is_auth}${is_capture}${is_refunded}${is_standalone_payment}${is_voided}${orderId}${owner}${pending}${source_data_pan}${source_data_sub_type}${source_data_type}${success}`;
    
    const expectedHmac = crypto.createHmac('sha512', hmacSecret)
                               .update(concatenatedString)
                               .digest('hex');

    if (receivedHmac !== expectedHmac) {
      return res.status(401).send('Unauthorized: HMAC signature mismatch');
    }

    if (success && !pending) {
      console.log(`Order ${orderId} successfully paid!`);
    } else {
      console.log(`Order ${orderId} payment failed or pending.`);
    }

    res.status(200).send('Transaction processed');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error processing Webhook');
  }
};
