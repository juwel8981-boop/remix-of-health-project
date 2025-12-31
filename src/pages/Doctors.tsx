import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Star, CheckCircle2, Clock, Building2, ChevronDown, Brain, Sparkles, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const specialties = [
  "All Specialties",
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Dermatologist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
];

const areas = [
  "All Areas",
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

// Symptom keywords mapped to specialties for AI analysis
const symptomKeywords: { keywords: string[]; specialty: string }[] = [
  { keywords: ["heart", "chest pain", "palpitation", "blood pressure", "hypertension", "cardiac", "heartbeat", "angina"], specialty: "Cardiologist" },
  { keywords: ["headache", "migraine", "seizure", "numbness", "memory", "tremor", "nerve", "brain", "stroke", "paralysis"], specialty: "Neurologist" },
  { keywords: ["skin", "rash", "acne", "eczema", "itching", "allergy", "hair loss", "psoriasis", "dermatitis"], specialty: "Dermatologist" },
  { keywords: ["bone", "joint", "fracture", "back pain", "spine", "arthritis", "knee", "shoulder", "hip", "muscle pain"], specialty: "Orthopedic" },
  { keywords: ["pregnancy", "menstrual", "period", "gynec", "uterus", "ovary", "fertility", "contraception", "menopause"], specialty: "Gynecologist" },
  { keywords: ["child", "baby", "infant", "pediatric", "vaccination", "growth", "developmental"], specialty: "Pediatrician" },
  { keywords: ["ear", "nose", "throat", "hearing", "sinus", "tonsil", "vertigo", "snoring", "voice"], specialty: "ENT Specialist" },
  { keywords: ["anxiety", "depression", "stress", "mental", "sleep disorder", "insomnia", "mood", "panic", "psychiatric"], specialty: "Psychiatrist" },
  { keywords: ["fever", "cold", "cough", "flu", "fatigue", "weakness", "general", "body ache", "infection"], specialty: "General Physician" },
];

const doctors = [
  // Cardiologists
  {
    id: 1,
    name: "Dr. Fazle Rabbi Chowdhury",
    specialty: "Cardiologist",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.9,
    reviews: 234,
    verified: true,
    experience: "22 years",
    fee: "৳2,500",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Mir Jamal Uddin",
    specialty: "Cardiologist",
    hospital: "United Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 189,
    verified: true,
    experience: "18 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Sohel Mahmud",
    specialty: "Cardiologist",
    hospital: "Praava Health",
    area: "Dhaka",
    rating: 4.7,
    reviews: 156,
    verified: true,
    experience: "15 years",
    fee: "৳1,800",
    available: false,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
  // Neurologists
  {
    id: 4,
    name: "Dr. Quazi Deen Mohammad",
    specialty: "Neurologist",
    hospital: "National Institute of Neurosciences",
    area: "Dhaka",
    rating: 4.9,
    reviews: 312,
    verified: true,
    experience: "25 years",
    fee: "৳2,500",
    available: true,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Dr. Mohammad Shah Kamal",
    specialty: "Neurologist",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 178,
    verified: true,
    experience: "16 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  // Pediatricians
  {
    id: 6,
    name: "Dr. Syeda Afroza",
    specialty: "Pediatrician",
    hospital: "Dhaka Shishu Hospital",
    area: "Dhaka",
    rating: 4.9,
    reviews: 423,
    verified: true,
    experience: "20 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 7,
    name: "Dr. Md. Benzir Ahmed",
    specialty: "Pediatrician",
    hospital: "Apollo Hospital",
    area: "Chittagong",
    rating: 4.8,
    reviews: 198,
    verified: true,
    experience: "14 years",
    fee: "৳1,200",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 8,
    name: "Dr. Farhana Haque",
    specialty: "Pediatrician",
    hospital: "Praava Health",
    area: "Dhaka",
    rating: 4.7,
    reviews: 145,
    verified: true,
    experience: "10 years",
    fee: "৳1,000",
    available: false,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
  },
  // Dermatologists
  {
    id: 9,
    name: "Dr. Rashida Begum",
    specialty: "Dermatologist",
    hospital: "Labaid Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 267,
    verified: true,
    experience: "18 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 10,
    name: "Dr. Md. Shahidullah Sikder",
    specialty: "Dermatologist",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.7,
    reviews: 189,
    verified: true,
    experience: "15 years",
    fee: "৳1,800",
    available: true,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
  // Gynecologists
  {
    id: 11,
    name: "Dr. Ferdousi Begum",
    specialty: "Gynecologist",
    hospital: "Dhaka Medical College",
    area: "Dhaka",
    rating: 4.9,
    reviews: 356,
    verified: true,
    experience: "22 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 12,
    name: "Dr. Mariha Alam Chowdhury",
    specialty: "Gynecologist",
    hospital: "Praava Health",
    area: "Dhaka",
    rating: 4.8,
    reviews: 234,
    verified: true,
    experience: "12 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 13,
    name: "Dr. Nahid Yasmin",
    specialty: "Gynecologist",
    hospital: "United Hospital",
    area: "Dhaka",
    rating: 4.7,
    reviews: 178,
    verified: true,
    experience: "16 years",
    fee: "৳1,800",
    available: false,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  // Orthopedic
  {
    id: 14,
    name: "Dr. Rezaul Karim",
    specialty: "Orthopedic",
    hospital: "National Institute of Traumatology",
    area: "Dhaka",
    rating: 4.9,
    reviews: 289,
    verified: true,
    experience: "20 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 15,
    name: "Dr. Khandaker Abu Taleb",
    specialty: "Orthopedic",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 198,
    verified: true,
    experience: "17 years",
    fee: "৳2,500",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 16,
    name: "Dr. Md. Shafiqul Islam",
    specialty: "Orthopedic",
    hospital: "Ibn Sina Hospital",
    area: "Sylhet",
    rating: 4.6,
    reviews: 134,
    verified: true,
    experience: "14 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
  // ENT Specialists
  {
    id: 17,
    name: "Dr. Kamrul Hassan Tarafder",
    specialty: "ENT Specialist",
    hospital: "Bangabandhu Sheikh Mujib Medical University",
    area: "Dhaka",
    rating: 4.9,
    reviews: 267,
    verified: true,
    experience: "23 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 18,
    name: "Dr. Belayat Hossain Siddique",
    specialty: "ENT Specialist",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 189,
    verified: true,
    experience: "18 years",
    fee: "৳1,800",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  // Psychiatrists
  {
    id: 19,
    name: "Dr. Mohammad Waziul Alam Chowdhury",
    specialty: "Psychiatrist",
    hospital: "National Institute of Mental Health",
    area: "Dhaka",
    rating: 4.9,
    reviews: 312,
    verified: true,
    experience: "20 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 20,
    name: "Dr. Helal Uddin Ahmed",
    specialty: "Psychiatrist",
    hospital: "United Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 234,
    verified: true,
    experience: "16 years",
    fee: "৳1,800",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  // General Physicians
  {
    id: 21,
    name: "Dr. Shoaib Ahmad",
    specialty: "General Physician",
    hospital: "Praava Health",
    area: "Dhaka",
    rating: 4.8,
    reviews: 456,
    verified: true,
    experience: "12 years",
    fee: "৳800",
    available: true,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 22,
    name: "Dr. Kabir Ahmed Khan",
    specialty: "General Physician",
    hospital: "Praava Health",
    area: "Dhaka",
    rating: 4.7,
    reviews: 389,
    verified: true,
    experience: "18 years",
    fee: "৳1,000",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 23,
    name: "Dr. Sajjadur Rahman",
    specialty: "General Physician",
    hospital: "Praava Health",
    area: "Dhaka",
    rating: 4.6,
    reviews: 278,
    verified: true,
    experience: "15 years",
    fee: "৳800",
    available: false,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 24,
    name: "Dr. Tahmina Akter",
    specialty: "General Physician",
    hospital: "Ibn Sina Diagnostic",
    area: "Chittagong",
    rating: 4.7,
    reviews: 198,
    verified: true,
    experience: "10 years",
    fee: "৳600",
    available: true,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 25,
    name: "Dr. Abdul Matin",
    specialty: "General Physician",
    hospital: "Popular Diagnostic",
    area: "Sylhet",
    rating: 4.5,
    reviews: 167,
    verified: true,
    experience: "20 years",
    fee: "৳700",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  // Additional specialists from different areas
  {
    id: 26,
    name: "Dr. Nazrul Islam",
    specialty: "Cardiologist",
    hospital: "Chittagong Medical College",
    area: "Chittagong",
    rating: 4.8,
    reviews: 234,
    verified: true,
    experience: "19 years",
    fee: "৳1,800",
    available: true,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 27,
    name: "Dr. Fatima Nasreen",
    specialty: "Dermatologist",
    hospital: "Evercare Hospital",
    area: "Dhaka",
    rating: 4.7,
    reviews: 145,
    verified: true,
    experience: "11 years",
    fee: "৳1,200",
    available: true,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 28,
    name: "Dr. Md. Harun-Or-Rashid",
    specialty: "Neurologist",
    hospital: "Rajshahi Medical College",
    area: "Rajshahi",
    rating: 4.6,
    reviews: 123,
    verified: true,
    experience: "14 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 29,
    name: "Dr. Shamima Akhter",
    specialty: "Gynecologist",
    hospital: "Khulna Medical College",
    area: "Khulna",
    rating: 4.7,
    reviews: 189,
    verified: true,
    experience: "16 years",
    fee: "৳1,200",
    available: true,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 30,
    name: "Dr. Mohammad Iqbal",
    specialty: "Orthopedic",
    hospital: "Rangpur Medical College",
    area: "Rangpur",
    rating: 4.5,
    reviews: 98,
    verified: true,
    experience: "13 years",
    fee: "৳1,000",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  // More Cardiologists
  { id: 31, name: "Dr. A.K.M. Mohibullah", specialty: "Cardiologist", hospital: "National Heart Foundation", area: "Dhaka", rating: 4.9, reviews: 456, verified: true, experience: "28 years", fee: "৳3,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 32, name: "Dr. Harisul Hoque", specialty: "Cardiologist", hospital: "NICVD", area: "Dhaka", rating: 4.9, reviews: 389, verified: true, experience: "25 years", fee: "৳2,500", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 33, name: "Dr. Md. Abdul Kader", specialty: "Cardiologist", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.8, reviews: 267, verified: true, experience: "20 years", fee: "৳2,200", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 34, name: "Dr. Syed Ali Ahsan", specialty: "Cardiologist", hospital: "BSMMU", area: "Dhaka", rating: 4.8, reviews: 312, verified: true, experience: "22 years", fee: "৳2,000", available: false, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 35, name: "Dr. Khurshed Ahmed", specialty: "Cardiologist", hospital: "Ibrahim Cardiac", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "18 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 36, name: "Dr. Afzalur Rahman", specialty: "Cardiologist", hospital: "Lab Aid Cardiac", area: "Dhaka", rating: 4.7, reviews: 178, verified: true, experience: "16 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 37, name: "Dr. Manzoor Mahmood", specialty: "Cardiologist", hospital: "Chittagong General Hospital", area: "Chittagong", rating: 4.6, reviews: 145, verified: true, experience: "15 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 38, name: "Dr. Shahabuddin Talukder", specialty: "Cardiologist", hospital: "Max Hospital", area: "Chittagong", rating: 4.6, reviews: 134, verified: true, experience: "14 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 39, name: "Dr. Nurul Amin", specialty: "Cardiologist", hospital: "Sylhet MAG Osmani Medical", area: "Sylhet", rating: 4.5, reviews: 112, verified: true, experience: "17 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 40, name: "Dr. Fazlur Rahman", specialty: "Cardiologist", hospital: "Rajshahi Heart Foundation", area: "Rajshahi", rating: 4.5, reviews: 98, verified: true, experience: "16 years", fee: "৳1,200", available: false, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  // More Neurologists
  { id: 41, name: "Dr. Anisul Haque", specialty: "Neurologist", hospital: "BSMMU", area: "Dhaka", rating: 4.9, reviews: 378, verified: true, experience: "24 years", fee: "৳2,500", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 42, name: "Dr. Badrul Alam", specialty: "Neurologist", hospital: "NINSH", area: "Dhaka", rating: 4.8, reviews: 289, verified: true, experience: "20 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 43, name: "Dr. Rajib Nayan Chowdhury", specialty: "Neurologist", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.8, reviews: 234, verified: true, experience: "18 years", fee: "৳2,200", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 44, name: "Dr. Shamsul Alam", specialty: "Neurologist", hospital: "United Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "16 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 45, name: "Dr. Maniruzzaman Bhuiyan", specialty: "Neurologist", hospital: "Lab Aid Hospital", area: "Dhaka", rating: 4.7, reviews: 167, verified: true, experience: "15 years", fee: "৳1,500", available: false, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 46, name: "Dr. Kazi Jannat Ara", specialty: "Neurologist", hospital: "Popular Diagnostic", area: "Dhaka", rating: 4.6, reviews: 145, verified: true, experience: "14 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 47, name: "Dr. Tapan Kumar Nath", specialty: "Neurologist", hospital: "Chittagong Medical College", area: "Chittagong", rating: 4.6, reviews: 134, verified: true, experience: "18 years", fee: "৳1,400", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 48, name: "Dr. Moushumi Dey", specialty: "Neurologist", hospital: "Imperial Hospital", area: "Chittagong", rating: 4.5, reviews: 112, verified: true, experience: "12 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 49, name: "Dr. Md. Rafiqul Islam", specialty: "Neurologist", hospital: "Sylhet Osmani Medical", area: "Sylhet", rating: 4.5, reviews: 98, verified: true, experience: "15 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 50, name: "Dr. Ashraful Haque", specialty: "Neurologist", hospital: "Khulna Medical College", area: "Khulna", rating: 4.4, reviews: 87, verified: true, experience: "13 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  // More Pediatricians
  { id: 51, name: "Dr. M.R. Khan", specialty: "Pediatrician", hospital: "Dhaka Shishu Hospital", area: "Dhaka", rating: 4.9, reviews: 534, verified: true, experience: "26 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 52, name: "Dr. Selina Akhter", specialty: "Pediatrician", hospital: "BSMMU", area: "Dhaka", rating: 4.9, reviews: 423, verified: true, experience: "22 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 53, name: "Dr. Md. Abid Hossain Molla", specialty: "Pediatrician", hospital: "Square Hospital", area: "Dhaka", rating: 4.8, reviews: 356, verified: true, experience: "18 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 54, name: "Dr. Shahana Akhter Rahman", specialty: "Pediatrician", hospital: "United Hospital", area: "Dhaka", rating: 4.8, reviews: 289, verified: true, experience: "16 years", fee: "৳1,500", available: false, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 55, name: "Dr. Mahbubul Hoque", specialty: "Pediatrician", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.7, reviews: 234, verified: true, experience: "15 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 56, name: "Dr. Rubina Jesmin", specialty: "Pediatrician", hospital: "Lab Aid Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "14 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 57, name: "Dr. Nurun Nahar Begum", specialty: "Pediatrician", hospital: "Ibn Sina Hospital", area: "Dhaka", rating: 4.6, reviews: 167, verified: true, experience: "12 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 58, name: "Dr. Kamal Uddin", specialty: "Pediatrician", hospital: "Chittagong Shishu Hospital", area: "Chittagong", rating: 4.6, reviews: 145, verified: true, experience: "16 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 59, name: "Dr. Asma Begum", specialty: "Pediatrician", hospital: "Max Hospital", area: "Chittagong", rating: 4.5, reviews: 123, verified: true, experience: "13 years", fee: "৳800", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 60, name: "Dr. Jahanara Begum", specialty: "Pediatrician", hospital: "Sylhet Women & Children", area: "Sylhet", rating: 4.5, reviews: 112, verified: true, experience: "14 years", fee: "৳800", available: false, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  // More Dermatologists
  { id: 61, name: "Dr. A.Z.M. Maidul Islam", specialty: "Dermatologist", hospital: "Dhaka Medical College", area: "Dhaka", rating: 4.9, reviews: 356, verified: true, experience: "24 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 62, name: "Dr. Lubna Khondker", specialty: "Dermatologist", hospital: "BSMMU", area: "Dhaka", rating: 4.8, reviews: 289, verified: true, experience: "18 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 63, name: "Dr. Mohammad Ali", specialty: "Dermatologist", hospital: "United Hospital", area: "Dhaka", rating: 4.8, reviews: 234, verified: true, experience: "16 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 64, name: "Dr. Sharmin Sultana", specialty: "Dermatologist", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "14 years", fee: "৳1,500", available: false, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 65, name: "Dr. Hasina Akhter", specialty: "Dermatologist", hospital: "Popular Diagnostic", area: "Dhaka", rating: 4.6, reviews: 167, verified: true, experience: "12 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 66, name: "Dr. Nazmul Haque", specialty: "Dermatologist", hospital: "Ibn Sina Diagnostic", area: "Dhaka", rating: 4.6, reviews: 145, verified: true, experience: "13 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 67, name: "Dr. Fatema Tuz Johora", specialty: "Dermatologist", hospital: "Chittagong Medical College", area: "Chittagong", rating: 4.5, reviews: 123, verified: true, experience: "15 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 68, name: "Dr. Syed Shafi Ahmed", specialty: "Dermatologist", hospital: "Imperial Hospital", area: "Chittagong", rating: 4.5, reviews: 112, verified: true, experience: "14 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 69, name: "Dr. Mst. Rokeya Begum", specialty: "Dermatologist", hospital: "Rajshahi Medical College", area: "Rajshahi", rating: 4.4, reviews: 98, verified: true, experience: "16 years", fee: "৳800", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 70, name: "Dr. Md. Shamsuzzaman", specialty: "Dermatologist", hospital: "Khulna Medical College", area: "Khulna", rating: 4.4, reviews: 87, verified: true, experience: "13 years", fee: "৳800", available: false, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  // More Gynecologists
  { id: 71, name: "Dr. Rowshan Ara Begum", specialty: "Gynecologist", hospital: "BSMMU", area: "Dhaka", rating: 4.9, reviews: 489, verified: true, experience: "26 years", fee: "৳2,500", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 72, name: "Dr. Firoza Begum", specialty: "Gynecologist", hospital: "Dhaka Medical College", area: "Dhaka", rating: 4.9, reviews: 412, verified: true, experience: "24 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 73, name: "Dr. Sayeba Akhter", specialty: "Gynecologist", hospital: "Square Hospital", area: "Dhaka", rating: 4.8, reviews: 356, verified: true, experience: "22 years", fee: "৳2,200", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 74, name: "Dr. Kohinoor Begum", specialty: "Gynecologist", hospital: "United Hospital", area: "Dhaka", rating: 4.8, reviews: 289, verified: true, experience: "20 years", fee: "৳2,000", available: false, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 75, name: "Dr. Jesmin Akter", specialty: "Gynecologist", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.7, reviews: 234, verified: true, experience: "16 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 76, name: "Dr. Nasreen Sultana", specialty: "Gynecologist", hospital: "Lab Aid Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "15 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 77, name: "Dr. Hosne Ara Begum", specialty: "Gynecologist", hospital: "Ibn Sina Hospital", area: "Dhaka", rating: 4.6, reviews: 167, verified: true, experience: "14 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 78, name: "Dr. Parveen Akhter", specialty: "Gynecologist", hospital: "Chittagong Medical College", area: "Chittagong", rating: 4.6, reviews: 156, verified: true, experience: "18 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 79, name: "Dr. Momena Begum", specialty: "Gynecologist", hospital: "Sylhet Women & Children", area: "Sylhet", rating: 4.5, reviews: 134, verified: true, experience: "16 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 80, name: "Dr. Razia Sultana", specialty: "Gynecologist", hospital: "Rajshahi Medical College", area: "Rajshahi", rating: 4.5, reviews: 123, verified: true, experience: "17 years", fee: "৳1,000", available: false, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  // More Orthopedics
  { id: 81, name: "Dr. A.K.M. Zahiruddin", specialty: "Orthopedic", hospital: "NITOR", area: "Dhaka", rating: 4.9, reviews: 378, verified: true, experience: "25 years", fee: "৳2,500", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 82, name: "Dr. Md. Shah Alam", specialty: "Orthopedic", hospital: "BSMMU", area: "Dhaka", rating: 4.8, reviews: 312, verified: true, experience: "22 years", fee: "৳2,200", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 83, name: "Dr. Syed Mozammel Hossain", specialty: "Orthopedic", hospital: "United Hospital", area: "Dhaka", rating: 4.8, reviews: 267, verified: true, experience: "20 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 84, name: "Dr. Kamrul Islam", specialty: "Orthopedic", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.7, reviews: 234, verified: true, experience: "18 years", fee: "৳2,000", available: false, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 85, name: "Dr. Mahmudul Hasan", specialty: "Orthopedic", hospital: "Lab Aid Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "16 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 86, name: "Dr. Sohel Ahmed", specialty: "Orthopedic", hospital: "Ibn Sina Hospital", area: "Dhaka", rating: 4.6, reviews: 167, verified: true, experience: "14 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 87, name: "Dr. Jahangir Alam", specialty: "Orthopedic", hospital: "Chittagong Medical College", area: "Chittagong", rating: 4.6, reviews: 145, verified: true, experience: "17 years", fee: "৳1,400", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 88, name: "Dr. Faruk Ahmed", specialty: "Orthopedic", hospital: "Max Hospital", area: "Chittagong", rating: 4.5, reviews: 123, verified: true, experience: "15 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 89, name: "Dr. Abdul Hai", specialty: "Orthopedic", hospital: "Sylhet MAG Osmani", area: "Sylhet", rating: 4.5, reviews: 112, verified: true, experience: "16 years", fee: "৳1,200", available: false, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 90, name: "Dr. Md. Aminul Islam", specialty: "Orthopedic", hospital: "Rajshahi Medical College", area: "Rajshahi", rating: 4.4, reviews: 98, verified: true, experience: "14 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  // More ENT Specialists
  { id: 91, name: "Dr. Pran Gopal Datta", specialty: "ENT Specialist", hospital: "BSMMU", area: "Dhaka", rating: 4.9, reviews: 345, verified: true, experience: "28 years", fee: "৳2,500", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 92, name: "Dr. Md. Abu Hanif", specialty: "ENT Specialist", hospital: "Dhaka Medical College", area: "Dhaka", rating: 4.8, reviews: 289, verified: true, experience: "22 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 93, name: "Dr. Harunur Rashid", specialty: "ENT Specialist", hospital: "United Hospital", area: "Dhaka", rating: 4.8, reviews: 234, verified: true, experience: "18 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 94, name: "Dr. Zahid Al Masum", specialty: "ENT Specialist", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "16 years", fee: "৳1,800", available: false, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 95, name: "Dr. Shahnaz Begum", specialty: "ENT Specialist", hospital: "Lab Aid Hospital", area: "Dhaka", rating: 4.6, reviews: 167, verified: true, experience: "14 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 96, name: "Dr. Abdul Latif", specialty: "ENT Specialist", hospital: "Ibn Sina Hospital", area: "Dhaka", rating: 4.6, reviews: 145, verified: true, experience: "15 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 97, name: "Dr. Mostafa Kamal", specialty: "ENT Specialist", hospital: "Chittagong Medical College", area: "Chittagong", rating: 4.5, reviews: 134, verified: true, experience: "16 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 98, name: "Dr. Tanjina Hossain", specialty: "ENT Specialist", hospital: "Imperial Hospital", area: "Chittagong", rating: 4.5, reviews: 112, verified: true, experience: "13 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 99, name: "Dr. Rezaul Karim", specialty: "ENT Specialist", hospital: "Sylhet MAG Osmani", area: "Sylhet", rating: 4.4, reviews: 98, verified: true, experience: "14 years", fee: "৳1,000", available: false, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 100, name: "Dr. Shamim Ahmed", specialty: "ENT Specialist", hospital: "Rajshahi Medical College", area: "Rajshahi", rating: 4.4, reviews: 87, verified: true, experience: "15 years", fee: "৳900", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  // More Psychiatrists
  { id: 101, name: "Dr. Md. Faruq Alam", specialty: "Psychiatrist", hospital: "NIMH", area: "Dhaka", rating: 4.9, reviews: 378, verified: true, experience: "24 years", fee: "৳2,500", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 102, name: "Dr. Jhunu Shamsun Nahar", specialty: "Psychiatrist", hospital: "BSMMU", area: "Dhaka", rating: 4.9, reviews: 312, verified: true, experience: "22 years", fee: "৳2,000", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 103, name: "Dr. Md. Golam Rabbani", specialty: "Psychiatrist", hospital: "Dhaka Medical College", area: "Dhaka", rating: 4.8, reviews: 267, verified: true, experience: "20 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 104, name: "Dr. Sultana Algin", specialty: "Psychiatrist", hospital: "Square Hospital", area: "Dhaka", rating: 4.8, reviews: 234, verified: true, experience: "18 years", fee: "৳2,000", available: false, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 105, name: "Dr. Mekhala Sarkar", specialty: "Psychiatrist", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.7, reviews: 198, verified: true, experience: "15 years", fee: "৳1,800", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 106, name: "Dr. Nahid Mahjabin Morshed", specialty: "Psychiatrist", hospital: "Lab Aid Hospital", area: "Dhaka", rating: 4.6, reviews: 167, verified: true, experience: "13 years", fee: "৳1,500", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 107, name: "Dr. Ahsan Uddin Ahmed", specialty: "Psychiatrist", hospital: "Ibn Sina Hospital", area: "Dhaka", rating: 4.6, reviews: 145, verified: true, experience: "14 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 108, name: "Dr. Syed Mahfuza Mubarak", specialty: "Psychiatrist", hospital: "Chittagong Medical College", area: "Chittagong", rating: 4.5, reviews: 123, verified: true, experience: "16 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 109, name: "Dr. Rashida Begum", specialty: "Psychiatrist", hospital: "Sylhet MAG Osmani", area: "Sylhet", rating: 4.5, reviews: 98, verified: true, experience: "15 years", fee: "৳1,000", available: false, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 110, name: "Dr. Mohammad Kamruzzaman", specialty: "Psychiatrist", hospital: "Rajshahi Medical College", area: "Rajshahi", rating: 4.4, reviews: 87, verified: true, experience: "12 years", fee: "৳900", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  // More General Physicians
  { id: 111, name: "Dr. Md. Billal Alam", specialty: "General Physician", hospital: "Praava Health", area: "Dhaka", rating: 4.8, reviews: 534, verified: true, experience: "18 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 112, name: "Dr. Fatema Begum", specialty: "General Physician", hospital: "DocTime", area: "Dhaka", rating: 4.8, reviews: 467, verified: true, experience: "16 years", fee: "৳800", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 113, name: "Dr. Rezaul Karim", specialty: "General Physician", hospital: "United Hospital", area: "Dhaka", rating: 4.7, reviews: 389, verified: true, experience: "14 years", fee: "৳1,200", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 114, name: "Dr. Nazma Akter", specialty: "General Physician", hospital: "Square Hospital", area: "Dhaka", rating: 4.7, reviews: 312, verified: true, experience: "15 years", fee: "৳1,000", available: false, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 115, name: "Dr. Shafiqul Islam", specialty: "General Physician", hospital: "Evercare Hospital", area: "Dhaka", rating: 4.6, reviews: 267, verified: true, experience: "12 years", fee: "৳1,000", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 116, name: "Dr. Hasina Begum", specialty: "General Physician", hospital: "Lab Aid Diagnostic", area: "Dhaka", rating: 4.6, reviews: 234, verified: true, experience: "13 years", fee: "৳700", available: true, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" },
  { id: 117, name: "Dr. Ataur Rahman", specialty: "General Physician", hospital: "Ibn Sina Diagnostic", area: "Dhaka", rating: 4.5, reviews: 198, verified: true, experience: "11 years", fee: "৳600", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 118, name: "Dr. Monira Begum", specialty: "General Physician", hospital: "Popular Diagnostic", area: "Dhaka", rating: 4.5, reviews: 178, verified: true, experience: "14 years", fee: "৳700", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 119, name: "Dr. Abdul Jalil", specialty: "General Physician", hospital: "Chittagong General Hospital", area: "Chittagong", rating: 4.5, reviews: 156, verified: true, experience: "16 years", fee: "৳600", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 120, name: "Dr. Salma Akter", specialty: "General Physician", hospital: "Max Hospital", area: "Chittagong", rating: 4.4, reviews: 134, verified: true, experience: "12 years", fee: "৳500", available: false, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 121, name: "Dr. Mofizur Rahman", specialty: "General Physician", hospital: "Imperial Hospital", area: "Chittagong", rating: 4.4, reviews: 123, verified: true, experience: "13 years", fee: "৳600", available: true, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face" },
  { id: 122, name: "Dr. Nasima Begum", specialty: "General Physician", hospital: "Sylhet MAG Osmani", area: "Sylhet", rating: 4.4, reviews: 112, verified: true, experience: "15 years", fee: "৳500", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 123, name: "Dr. Golam Mostafa", specialty: "General Physician", hospital: "Mount Adora Hospital", area: "Sylhet", rating: 4.3, reviews: 98, verified: true, experience: "11 years", fee: "৳500", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 124, name: "Dr. Shahnaz Parvin", specialty: "General Physician", hospital: "Rajshahi Medical College", area: "Rajshahi", rating: 4.3, reviews: 89, verified: true, experience: "14 years", fee: "৳500", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 125, name: "Dr. Md. Hafizur Rahman", specialty: "General Physician", hospital: "Khulna Medical College", area: "Khulna", rating: 4.3, reviews: 78, verified: true, experience: "16 years", fee: "৳500", available: false, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 126, name: "Dr. Shamsun Nahar", specialty: "General Physician", hospital: "Rangpur Medical College", area: "Rangpur", rating: 4.2, reviews: 67, verified: true, experience: "12 years", fee: "৳400", available: true, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
  { id: 127, name: "Dr. Belal Hossain", specialty: "General Physician", hospital: "Barisal Sher-E-Bangla", area: "Barisal", rating: 4.2, reviews: 56, verified: true, experience: "13 years", fee: "৳400", available: true, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
  { id: 128, name: "Dr. Farida Yasmin", specialty: "General Physician", hospital: "Mymensingh Medical", area: "Mymensingh", rating: 4.2, reviews: 45, verified: true, experience: "10 years", fee: "৳400", available: true, image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face" },
  { id: 129, name: "Dr. Nurul Islam", specialty: "General Physician", hospital: "Comilla Medical College", area: "Chittagong", rating: 4.1, reviews: 34, verified: true, experience: "11 years", fee: "৳400", available: true, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face" },
  { id: 130, name: "Dr. Mahfuza Khatun", specialty: "General Physician", hospital: "Bogra Medical Center", area: "Rajshahi", rating: 4.1, reviews: 28, verified: true, experience: "9 years", fee: "৳400", available: false, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face" },
];

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showFilters, setShowFilters] = useState(false);
  
  // AI Doctor Finder state
  const [showAIFinder, setShowAIFinder] = useState(false);
  const [symptomText, setSymptomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  const analyzeSymptoms = () => {
    if (symptomText.trim().length === 0) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const text = symptomText.toLowerCase();
      const specialtyCounts: Record<string, number> = {};
      
      // Match keywords in user's text to find relevant specialties
      symptomKeywords.forEach(({ keywords, specialty }) => {
        keywords.forEach(keyword => {
          if (text.includes(keyword.toLowerCase())) {
            specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
          }
        });
      });
      
      // Get the specialty with most keyword matches, default to General Physician
      const recommendedSpecialty = Object.entries(specialtyCounts).length > 0
        ? Object.entries(specialtyCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "General Physician";
      
      setAiRecommendation(recommendedSpecialty);
      setSelectedSpecialty(recommendedSpecialty);
      setIsAnalyzing(false);
      setShowAIFinder(false);
      setSymptomText("");
    }, 1500);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty;
    const matchesArea = selectedArea === "All Areas" || doctor.area === selectedArea;
    return matchesSearch && matchesSpecialty && matchesArea;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Find Your Doctor
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Search from over 10,000+ verified doctors across Bangladesh
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-2 shadow-healthcare-lg max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-muted">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, specialties..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted md:w-48">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
              <Button variant="accent" size="lg">
                <Search className="w-5 h-5" />
                <span className="hidden md:inline ml-2">Search</span>
              </Button>
            </div>
          </motion.div>

          {/* AI Doctor Finder Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-6"
          >
            <Button 
              onClick={() => setShowAIFinder(true)}
              className="bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 gap-2"
            >
              <Brain className="w-5 h-5" />
              <span>AI Doctor Finder</span>
              <Sparkles className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* AI Doctor Finder Dialog */}
      <Dialog open={showAIFinder} onOpenChange={setShowAIFinder}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI Doctor Finder
            </DialogTitle>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {!isAnalyzing ? (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-muted-foreground">
                  Describe your symptoms in detail and our AI will recommend the right specialist.
                </p>
                
                <Textarea
                  placeholder="E.g., I've been having severe headaches for the past week, along with dizziness and sometimes blurred vision..."
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Be as detailed as possible for better recommendations
                  </p>
                  <Button 
                    onClick={analyzeSymptoms} 
                    disabled={symptomText.trim().length === 0}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Analyze Symptoms
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <Brain className="w-8 h-8 text-primary" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <p className="text-foreground font-medium">Analyzing symptoms...</p>
                <p className="text-sm text-muted-foreground">Finding the best specialist for you</p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* AI Recommendation Banner */}
      {aiRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border-b border-primary/20"
        >
          <div className="healthcare-container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-foreground">
                  <span className="font-medium">AI Recommendation:</span> Based on your symptoms, we suggest seeing a{" "}
                  <span className="text-primary font-semibold">{aiRecommendation}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setAiRecommendation(null);
                setSelectedSpecialty("All Specialties");
              }}>
                Clear
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="healthcare-card sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">Filters</h3>

                {/* Specialty Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Specialty
                  </label>
                  <div className="space-y-2">
                    {specialties.map((specialty) => (
                      <label
                        key={specialty}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="specialty"
                          checked={selectedSpecialty === specialty}
                          onChange={() => setSelectedSpecialty(specialty)}
                          className="w-4 h-4 text-primary border-border focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Availability
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-border focus:ring-primary" />
                      <span className="text-sm text-foreground">Available Today</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-border focus:ring-primary" />
                      <span className="text-sm text-foreground">Online Consultation</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Relevance <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Doctor Cards */}
              <div className="space-y-4">
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/doctors/${doctor.id}`} className="block healthcare-card">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover mx-auto sm:mx-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-display text-lg font-semibold text-foreground">
                              {doctor.name}
                            </h3>
                            {doctor.verified && (
                              <div className="flex items-center gap-1 justify-center sm:justify-start">
                                <CheckCircle2 className="w-4 h-4 text-healthcare-green" />
                                <span className="text-xs text-healthcare-green font-medium">Verified</span>
                              </div>
                            )}
                          </div>
                          <p className="text-primary font-medium mb-1">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground text-sm mb-2">
                            <Building2 className="w-4 h-4" />
                            <span>{doctor.hospital}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-accent fill-accent" />
                              <span className="font-semibold text-foreground">{doctor.rating}</span>
                              <span className="text-muted-foreground">({doctor.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{doctor.experience}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{doctor.area}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-end justify-between gap-4">
                          <div className="text-center sm:text-right">
                            <p className="text-2xl font-bold text-foreground">{doctor.fee}</p>
                            <p className="text-xs text-muted-foreground">Consultation Fee</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {doctor.available ? (
                              <span className="healthcare-badge-success text-xs">
                                <span className="w-2 h-2 rounded-full bg-healthcare-green mr-1" />
                                Available Today
                              </span>
                            ) : (
                              <span className="healthcare-badge text-xs">
                                Next Available: Tomorrow
                              </span>
                            )}
                            <Button variant="healthcare" size="sm">
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
