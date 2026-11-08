import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User';
import Service from '../models/Service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    // Fetch context
    const doctors = await User.find({ role: 'Doctor' });
    const services = await Service.find();

    const servicesContext = services.map(s => s.name + " (" + s.specialty + ") - Price: " + s.price + " EGP").join(', ');
    const doctorsContext = doctors.map(d => "Dr. " + d.firstName + " " + d.lastName + " (" + d.specialty + ")").join(', ');

    const context = "You are the official AI assistant for MediCare Medical Center. " +
      "Available Services: " + servicesContext + ". " +
      "Our Doctors: " + doctorsContext + ". " +
      "Instructions: " +
      "- Answer in Arabic (mainly) or English as requested. " +
      "- Be professional, welcoming, and helpful. " +
      "- If asked about booking, tell them they can book through the website's booking section. " +
      "- If asked about symptoms, suggest the appropriate specialty based on the services we have.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: context 
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Chatbot Error', error: error.message });
  }
};
